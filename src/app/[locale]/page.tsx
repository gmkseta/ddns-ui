'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import LoginForm from '@/components/LoginForm';
import Header from '@/components/Header';
import StatusCards from '@/components/StatusCards';
import ExportImportModal from '@/components/ExportImportModal';
import AddRecordModal from '@/components/AddRecordModal';
import EditRecordModal from '@/components/EditRecordModal';

// 유틸 함수들 import
import { 
  checkAuth, 
  login, 
  logout, 
  getCurrentIP, 
  getApiKeys, 
  getZones, 
  getRecords, 
  updateDDNS, 
  toggleDDNSAutoUpdate,
  User, 
  APIKey, 
  Zone, 
  DNSRecord 
} from '@/utils/api';
import { 
  getSelectedApiKey, 
  setSelectedApiKey, 
  getSelectedZone, 
  setSelectedZone 
} from '@/utils/storage';
import { 
  sortRecords, 
  updateSortState, 
  SortField, 
  SortDirection 
} from '@/utils/sort';
import { 
  showSuccessToast, 
  handleApiError 
} from '@/utils/toast';
import { formatErrorMessage } from '@/utils/format';

// 정렬 상태 (기본: DDNS 반영 상태 먼저)
const DEFAULT_SORT: SortField = 'synced';
const DEFAULT_DIRECTION: SortDirection = 'desc';

// 로컬 스토리지 키들은 storage utils에서 관리됨

export default function Home() {
  const t = useTranslations();
  const tDns = useTranslations('dns');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // IP 확인 상태
  const [currentIP, setCurrentIP] = useState<string | null>(null);
  const [ipLoading, setIpLoading] = useState(false);
  const [ipError, setIpError] = useState('');
  
  // DDNS 수동 갱신 상태
  const [ddnsLoading, setDdnsLoading] = useState(false);
  
  // Export/Import 모달 상태
  const [exportImportModal, setExportImportModal] = useState<{
    isOpen: boolean;
    mode: 'export' | 'import';
  }>({
    isOpen: false,
    mode: 'export',
  });
  
  // Add Record 모달 상태
  const [addRecordModal, setAddRecordModal] = useState(false);
  
  // Edit Record 모달 상태
  const [editRecordModal, setEditRecordModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DNSRecord | null>(null);
  
  // 정렬 상태
  const [sortBy, setSortBy] = useState<SortField>(DEFAULT_SORT);
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_DIRECTION);
  
  // DNS 레코드 관리 상태
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [selectedApiKey, setSelectedApiKeyState] = useState<string>('');
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZoneState] = useState<string>('');
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(false);

  // Zone 선택과 레코드 로드를 함께 처리하는 함수
  const selectZoneAndLoadRecords = useCallback(async (zoneId: string, apiKeyId?: string) => {
    setSelectedZoneState(zoneId);
    setRecords([]);
    
    // 로컬 스토리지에 저장
    if (zoneId) {
      setSelectedZone(zoneId);
    } else {
      setSelectedZoneState('');
    }
    
    const keyToUse = apiKeyId || selectedApiKey;
    if (!zoneId || !keyToUse) return;

    setRecordsLoading(true);
    try {
      const recordList = await getRecords(zoneId, keyToUse);
      setRecords(recordList);
    } catch (error) {
      handleApiError(error, '레코드 로드 오류');
    } finally {
      setRecordsLoading(false);
    }
  }, [selectedApiKey]);

  // API 키 선택과 Zone 로드를 함께 처리하는 함수
  const selectApiKeyAndLoadZones = useCallback(async (apiKeyId: string) => {
    setSelectedApiKeyState(apiKeyId);
    setSelectedZoneState('');
    setRecords([]);
    
    // 로컬 스토리지에 저장
    if (apiKeyId) {
      setSelectedApiKey(apiKeyId);
    } else {
      setSelectedApiKeyState('');
    }
    
    if (!apiKeyId) {
      setZones([]);
      return;
    }

    setZonesLoading(true);
    try {
      const zoneList = await getZones(apiKeyId);
      setZones(zoneList);
      
      if (zoneList.length > 0) {
        // 이전에 선택한 Zone이 있는지 확인
        const savedZone = getSelectedZone();
        const validSavedZone = savedZone && zoneList.find((zone: Zone) => zone.id === savedZone);
        
        // 이전 선택이 유효하면 그것을 사용, 아니면 첫 번째 Zone 사용
        const zoneToSelect = validSavedZone ? savedZone : zoneList[0].id;
        await selectZoneAndLoadRecords(zoneToSelect, apiKeyId);
      }
    } catch (error) {
      handleApiError(error, 'Zone 로드 오류');
    } finally {
      setZonesLoading(false);
    }
  }, [selectZoneAndLoadRecords]);

  // API 키 목록 로드
  const loadApiKeys = useCallback(async () => {
    try {
      const apiKeyList = await getApiKeys();
      setApiKeys(apiKeyList);
      
      // 자동 선택 로직
      if (apiKeyList.length > 0) {
        // 이전에 선택한 API 키가 있는지 확인
        const savedApiKey = getSelectedApiKey();
        const validSavedKey = savedApiKey && apiKeyList.find((key: APIKey) => key.id === savedApiKey);
        
        // 이전 선택이 유효하면 그것을 사용, 아니면 첫 번째 키 사용
        const keyToSelect = validSavedKey ? savedApiKey : apiKeyList[0].id;
        
        // API 키 선택과 Zone 로드를 순차적으로 실행
        await selectApiKeyAndLoadZones(keyToSelect);
      }
    } catch (error) {
      handleApiError(error, 'API 키 로드 오류');
    }
  }, [selectApiKeyAndLoadZones]);

  // 인증 확인 함수
  const checkAuthAndSetUser = async () => {
    try {
      const userData = await checkAuth();
      setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // IP 확인 함수
  const fetchCurrentIP = useCallback(async () => {
    setIpLoading(true);
    setIpError('');
    try {
      const ip = await getCurrentIP();
      setCurrentIP(ip);
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      setIpError(errorMessage);
    } finally {
      setIpLoading(false);
    }
  }, []);

  // 현재 사용자 정보 확인
  useEffect(() => {
    checkAuthAndSetUser();
  }, []);

  // 로그인 후 API 키 로드 및 IP 조회
  useEffect(() => {
    if (user) {
      loadApiKeys();
      fetchCurrentIP(); // 자동으로 IP 조회
    }
  }, [user, loadApiKeys, fetchCurrentIP]);

  // 로그인 처리 함수
  const handleLogin = async (username: string, password: string) => {
    setLoginLoading(true);
    setLoginError('');

    try {
      const userData = await login(username, password);
      setUser(userData);
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      setLoginError(errorMessage === t('auth.loginError') ? errorMessage : t('auth.loginErrorGeneric'));
    } finally {
      setLoginLoading(false);
    }
  };

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      // 상태 초기화
      setApiKeys([]);
      setSelectedApiKeyState('');
      setZones([]);
      setSelectedZoneState('');
      setRecords([]);
      setCurrentIP(null);
      setIpError('');
    } catch (error) {
      handleApiError(error, 'Logout error');
    }
  };

  const handleApiKeyChange = async (apiKeyId: string) => {
    try {
      await selectApiKeyAndLoadZones(apiKeyId);
    } catch (error) {
      handleApiError(error, 'API 키 변경 오류');
    }
  };

  const handleZoneChange = async (zoneId: string) => {
    try {
      await selectZoneAndLoadRecords(zoneId);
    } catch (error) {
      handleApiError(error, 'Zone 변경 오류');
    }
  };

  const handleReload = async () => {
    if (selectedApiKey) {
      try {
        await selectApiKeyAndLoadZones(selectedApiKey);
      } catch (error) {
        handleApiError(error, '새로고침 오류');
      }
    }
  };

  // 정렬 함수
  const handleSort = (field: SortField) => {
    const newSortState = updateSortState(field, sortBy, sortDirection);
    setSortBy(newSortState.sortBy);
    setSortDirection(newSortState.sortDirection);
  };

  // IP 반영 상태 확인 함수
  const getRecordSyncStatus = (record: DNSRecord): 'synced' | 'notSynced' | 'notTarget' | 'noData' => {
    // DDNS가 비활성화된 경우
    if (!record.autoUpdate) {
      return 'notTarget';
    }
    
    // A 레코드의 경우 IP 비교
    if (record.type === 'A') {
      if (!currentIP) return 'noData';
      return record.content === currentIP ? 'synced' : 'notSynced';
    }
    
    // CNAME이나 다른 타입은 현재 비교 불가
    return 'notTarget';
  };

  // 정렬된 레코드 배열
  const sortedRecords = sortRecords(records, sortBy, sortDirection, currentIP);

  // DDNS 수동 갱신 함수
  const handleDDNSUpdate = async () => {
    setDdnsLoading(true);

    try {
      const result = await updateDDNS(selectedApiKey);

      // API 응답 구조에 맞게 수정
      const updated = result.updated || [];
      const errors = result.errors || [];
      const skipped = result.results?.filter((r) => r.status === 'skipped') || [];
      
      // 결과 상세 정보 생성
      let message = `DDNS 갱신 완료!\n\n`;
      message += `현재 IP: ${result.currentIP || 'N/A'}\n`;
      message += `총 ${result.totalRecords || 0}개 대상 레코드\n`;
      message += `업데이트: ${updated.length}개\n`;
      if (skipped.length > 0) {
        message += `건너뜀: ${skipped.length}개 (변경불필요)\n`;
      }
      if (errors.length > 0) {
        message += `오류: ${errors.length}개\n`;
      }

      // 성공한 업데이트 상세 정보
      if (updated.length > 0) {
        message += `\n업데이트된 레코드:\n`;
        updated.forEach((record: { name: string; zoneName?: string; content: string; message?: string }) => {
          const zoneInfo = record.zoneName ? ` (${record.zoneName})` : '';
          message += `• ${record.name}${zoneInfo}: ${record.content}\n`;
          if (record.message && record.message.includes('변환')) {
            message += `  ${record.message}\n`;
          }
        });
      }

      // 에러 상세 정보
      if (errors.length > 0) {
        message += `\n에러 발생 레코드:\n`;
        errors.forEach((error: { name: string; zoneName?: string; message?: string; error?: string }) => {
          const zoneInfo = error.zoneName ? ` (${error.zoneName})` : '';
          message += `• ${error.name}${zoneInfo}: ${error.message || error.error}\n`;
        });
      }

      showSuccessToast(message);
      
      // 레코드 목록 새로고침
      if (selectedZone && selectedApiKey) {
        await selectZoneAndLoadRecords(selectedZone);
      }
    } catch (error) {
      handleApiError(error, 'DDNS update error');
    } finally {
      setDdnsLoading(false);
    }
  };

  // DDNS 토글 상태 변경 (DB에도 반영)
  const handleAutoUpdateToggle = async (recordId: string, currentValue: boolean) => {
    try {
      // 로컬 상태 먼저 업데이트 (즉시 반응)
      setRecords(prev => prev.map(r => 
        r.id === recordId 
          ? { ...r, autoUpdate: !currentValue }
          : r
      ));

      // API로 실제 DB 업데이트 (현재 선택된 zone/apiKey 정보 포함)
      const result = await toggleDDNSAutoUpdate(recordId, !currentValue, selectedZone, selectedApiKey);
      
      // 성공 메시지 표시
      showSuccessToast(result.message);
      
    } catch (error) {
      // 에러 발생 시 로컬 상태 되돌리기
      setRecords(prev => prev.map(r => 
        r.id === recordId 
          ? { ...r, autoUpdate: currentValue }
          : r
      ));
      handleApiError(error, 'DDNS toggle error');
    }
  };

  // Export/Import 모달 관리
  const openExportModal = () => {
    setExportImportModal({ isOpen: true, mode: 'export' });
  };

  const openImportModal = () => {
    setExportImportModal({ isOpen: true, mode: 'import' });
  };

  const closeExportImportModal = () => {
    setExportImportModal({ isOpen: false, mode: 'export' });
  };

  // Edit Record 모달 관리
  const openEditModal = (record: DNSRecord) => {
    setSelectedRecord(record);
    setEditRecordModal(true);
  };

  const closeEditModal = () => {
    setEditRecordModal(false);
    setSelectedRecord(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginForm
        onLogin={handleLogin}
        loading={loginLoading}
        error={loginError}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header 
          user={user} 
          onLogout={handleLogout}
          onExport={openExportModal}
          onImport={openImportModal}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StatusCards
            currentIP={currentIP}
            ipLoading={ipLoading}
            ipError={ipError}
            apiKeysCount={apiKeys.length}
            autoUpdateCount={records.filter(r => r.autoUpdate).length}
            onFetchIP={fetchCurrentIP}
          />

          {/* DNS 레코드 관리 메인 콘텐츠 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* 설정 섹션 */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{tDns('management')}</h2>
                <button
                  onClick={handleReload}
                  disabled={zonesLoading || recordsLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <svg 
                    className={`w-4 h-4 ${(zonesLoading || recordsLoading) ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{t('common.refresh')}</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* API 키 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {tDns('apiKeySelect')}
                  </label>
                  <select
                    value={selectedApiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{tDns('selectApiKey')}</option>
                    {apiKeys.map((key) => (
                      <option key={key.id} value={key.id}>
                        {key.name || `API Key (${key.token.substring(0, 8)}...)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Zone 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {tDns('zoneSelect')}
                  </label>
                  <select
                    value={selectedZone}
                    onChange={(e) => handleZoneChange(e.target.value)}
                    disabled={zonesLoading || !selectedApiKey}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-600"
                  >
                    <option value="">
                      {zonesLoading ? tDns('loadingZones') : tDns('selectZone')}
                    </option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* DDNS 기능 설명 */}
            <div className="m-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="px-4">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    {tDns('autoUpdateFeature')}
                  </h4>
                  <p 
                    className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: tDns('autoUpdateDescription') }}
                  />
                </div>
              </div>
            </div>

            {/* DNS 레코드 목록 */}
            <div className="p-6">
              {recordsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-300">{tDns('loadingRecords')}</span>
                </div>
              ) : !selectedZone ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">{tDns('selectZonePrompt')}</p>
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">{tDns('noRecords')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 헤더와 액션 버튼들 */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {tDns('recordsCount', { count: records.length })}
                    </h3>
                    <div className="flex items-center space-x-3">
                      {/* DDNS 수동 갱신 버튼 */}
                      <button
                        onClick={handleDDNSUpdate}
                        disabled={ddnsLoading || !selectedApiKey || !selectedZone || records.filter(r => r.autoUpdate).length === 0}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        title={records.filter(r => r.autoUpdate).length === 0 ? t('ddns.noAutoUpdateRecords') : ''}
                      >
                        <svg 
                          className={`w-4 h-4 ${ddnsLoading ? 'animate-spin' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>
                          {ddnsLoading 
                            ? t('common.updating') 
                            : `${tDns('updateDDNS')} (${records.filter(r => r.autoUpdate).length})`
                          }
                        </span>
                      </button>
                      
                      {/* 레코드 추가 버튼 */}
                      <button 
                        onClick={() => setAddRecordModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>{tDns('addRecord')}</span>
                      </button>
                    </div>
                  </div>

                  {/* 테이블 헤더 (소팅 가능) */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      {/* 레코드 이름 */}
                      <button
                        onClick={() => handleSort('name')}
                        className="col-span-3 flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                      >
                        <span>{tDns('recordName')}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </button>
                      
                      {/* 타입 */}
                      <button
                        onClick={() => handleSort('type')}
                        className="col-span-1 flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                      >
                        <span>{tDns('type')}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </button>
                      
                      {/* 콘텐츠 */}
                      <button
                        onClick={() => handleSort('content')}
                        className="col-span-2 flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                      >
                        <span>{tDns('content')}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </button>
                      
                      {/* TTL */}
                      <button
                        onClick={() => handleSort('ttl')}
                        className="col-span-1 flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                      >
                        <span>TTL</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </button>
                      
                      {/* DDNS 설정 */}
                      <button
                        onClick={() => handleSort('autoUpdate')}
                        className="col-span-2 flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center justify-center"
                      >
                        <span>{tDns('ddnsSetting')}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </button>
                      
                      {/* IP 반영상태 */}
                      <button
                        onClick={() => handleSort('synced')}
                        className="col-span-2 flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center justify-center"
                      >
                        <span>{tDns('ddnsSync')}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </button>
                      
                      {/* 액션 */}
                      <div className="col-span-1 text-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('dns.actions')}</span>
                      </div>
                    </div>
                  </div>

                  {/* 레코드 목록 (정렬된 순서로) */}
                  <div className="space-y-2">
                    {sortedRecords.map((record) => (
                      <div key={record.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* 레코드 이름 */}
                          <div className="col-span-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900 dark:text-white text-sm">{record.name}</span>
                              {record.proxied && (
                                <span className="px-2 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-md">
                                  Proxied
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* 타입 */}
                          <div className="col-span-1">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md">
                              {record.type}
                            </span>
                          </div>
                          
                          {/* 콘텐츠 */}
                          <div className="col-span-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300 font-mono break-all">{record.content}</span>
                          </div>
                          
                          {/* TTL */}
                          <div className="col-span-1">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{record.ttl}s</span>
                          </div>
                          
                          {/* DDNS 설정 토글 */}
                          <div className="col-span-2 flex items-center justify-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={record.autoUpdate || false}
                                onChange={() => handleAutoUpdateToggle(record.id, !!record.autoUpdate)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                {record.autoUpdate ? tDns('ddnsActive') : tDns('ddnsInactive')}
                              </span>
                            </label>
                          </div>
                          
                          {/* IP 반영상태 */}
                          <div className="col-span-2 flex items-center justify-center">
                            {(() => {
                              const syncStatus = getRecordSyncStatus(record);
                              
                              switch (syncStatus) {
                                case 'synced':
                                  return (
                                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      {tDns('synced')}
                                    </span>
                                  );
                                  
                                case 'notSynced':
                                  return (
                                    <span 
                                      className="inline-flex items-center px-3 py-1 text-sm font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full"
                                      title={`현재 IP: ${currentIP || 'N/A'}, 레코드 IP: ${record.content}`}
                                    >
                                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                      </svg>
                                      {tDns('notSynced')}
                                    </span>
                                  );
                                  
                                case 'notTarget':
                                  return (
                                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                      </svg>
                                      {tDns('notTarget')}
                                    </span>
                                  );
                                  
                                case 'noData':
                                default:
                                  return (
                                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                                      </svg>
                                      {tDns('checkingIP')}
                                    </span>
                                  );
                              }
                            })()}
                          </div>
                          
                          {/* 액션 버튼 */}
                          <div className="col-span-1 flex items-center justify-center">
                            <button
                              onClick={() => openEditModal(record)}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title={t('modal.editRecord.title')}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Export/Import 모달 */}
      <ExportImportModal
        isOpen={exportImportModal.isOpen}
        mode={exportImportModal.mode}
        onClose={closeExportImportModal}
      />

      {/* 레코드 추가 모달 */}
      <AddRecordModal
        isOpen={addRecordModal}
        onClose={() => setAddRecordModal(false)}
        selectedZone={selectedZone}
        selectedApiKey={selectedApiKey}
        onRecordAdded={async () => {
          // 레코드 추가 후 목록 새로고침
          if (selectedZone && selectedApiKey) {
            await selectZoneAndLoadRecords(selectedZone);
          }
        }}
      />

      {/* 레코드 수정 모달 */}
      <EditRecordModal
        isOpen={editRecordModal}
        onClose={closeEditModal}
        selectedZone={selectedZone}
        selectedApiKey={selectedApiKey}
        record={selectedRecord}
        onRecordUpdated={async () => {
          // 레코드 수정 후 목록 새로고침
          if (selectedZone && selectedApiKey) {
            await selectZoneAndLoadRecords(selectedZone);
          }
        }}
      />
    </>
  );
}
