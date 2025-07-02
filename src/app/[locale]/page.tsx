'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import LoginForm from '@/components/LoginForm';
import Header from '@/components/Header';
import StatusCards from '@/components/StatusCards';
import ExportImportModal from '@/components/ExportImportModal';
import AddRecordModal from '@/components/AddRecordModal';
import LanguageSwitcher from '@/components/LanguageSwitcher';

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
  toggleAutoUpdate,
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
  showErrorToast, 
  handleApiError 
} from '@/utils/toast';
import { formatErrorMessage } from '@/utils/format';

// 정렬 상태 (기본: DDNS 활성화된 것들 먼저)
const DEFAULT_SORT: SortField = 'autoUpdate';
const DEFAULT_DIRECTION: SortDirection = 'desc';

// 로컬 스토리지 키들
const STORAGE_KEYS = {
  selectedApiKey: 'ddns-ui-selected-api-key',
  selectedZone: 'ddns-ui-selected-zone',
};

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

  // 현재 사용자 정보 확인
  useEffect(() => {
    checkAuthAndSetUser();
  }, []);

  // 로그인 후 API 키 로드
  useEffect(() => {
    if (user) {
      loadApiKeys();
    }
  }, [user]);

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

  // IP 확인 함수
  const fetchCurrentIP = async () => {
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
  };

  // API 키 목록 로드
  const loadApiKeys = async () => {
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
  };

  // API 키 선택과 Zone 로드를 함께 처리하는 함수
  const selectApiKeyAndLoadZones = async (apiKeyId: string) => {
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
        
        if (validSavedZone) {
          await selectZoneAndLoadRecords(savedZone, apiKeyId);
        }
      }
    } catch (error) {
      handleApiError(error, 'Zone 로드 오류');
    } finally {
      setZonesLoading(false);
    }
  };

  // Zone 선택과 레코드 로드를 함께 처리하는 함수
  const selectZoneAndLoadRecords = async (zoneId: string, apiKeyId?: string) => {
    setSelectedZoneState(zoneId);
    setRecords([]);
    
    // 로컬 스토리지에 저장
    if (zoneId) {
      setSelectedZone(zoneId);
    } else {
      setSelectedZoneState('');
    }
    
    if (!zoneId || !selectedApiKey) return;

    setRecordsLoading(true);
    try {
      const recordList = await getRecords(zoneId, apiKeyId || selectedApiKey);
      setRecords(recordList);
    } catch (error) {
      handleApiError(error, '레코드 로드 오류');
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleApiKeyChange = async (apiKeyId: string) => {
    await selectApiKeyAndLoadZones(apiKeyId);
  };

  const handleZoneChange = async (zoneId: string) => {
    await selectZoneAndLoadRecords(zoneId);
  };

  const handleReload = async () => {
    if (selectedApiKey) {
      await selectApiKeyAndLoadZones(selectedApiKey);
    }
  };

  // 정렬 함수
  const handleSort = (field: SortField) => {
    const newSortState = updateSortState(field, sortBy, sortDirection);
    setSortBy(newSortState.sortBy);
    setSortDirection(newSortState.sortDirection);
  };

  // 정렬된 레코드 배열
  const sortedRecords = sortRecords(records, sortBy, sortDirection);

  // DDNS 수동 갱신 함수
  const handleDDNSUpdate = async () => {
    setDdnsLoading(true);

    try {
      const result = await updateDDNS(selectedApiKey);

      // API 응답 구조에 맞게 수정
      const updated = result.updated || [];
      const errors = result.errors || [];
      
      // 결과 상세 정보 생성
      let message = `🔄 DDNS 갱신 완료!\n\n`;
      message += `📊 총 ${updated.length + errors.length}개 레코드 중 ${updated.length}개 업데이트됨\n`;
      
      if (errors.length > 0) {
        message += `❌ 오류: ${errors.length}개\n`;
      }

      // 성공한 업데이트 상세 정보
      if (updated.length > 0) {
        message += `\n📋 업데이트된 레코드:\n`;
        updated.forEach((record: DNSRecord) => {
          message += `  ✅ ${record.name}: ${record.content}\n`;
        });
      }

      // 에러 상세 정보
      if (errors.length > 0) {
        message += `\n📋 에러 발생 레코드:\n`;
        errors.forEach((error: any) => {
          message += `  ❌ ${error.record || error.name}: ${error.message || error.error}\n`;
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

  // DDNS 자동 갱신 설정 토글
  const handleAutoUpdateToggle = async (recordId: string, currentValue: boolean) => {
    try {
      const record = records.find(r => r.id === recordId);
      if (!record) return;

      const updatedRecord = await toggleAutoUpdate(
        record.id, 
        !currentValue, 
        selectedZone, 
        selectedApiKey
      );

      // 로컬 상태 업데이트
      setRecords(prev => prev.map(r => 
        r.id === recordId 
          ? { ...r, autoUpdate: !currentValue }
          : r
      ));

      const message = !currentValue ? 
        t('dns.autoUpdateEnabled') : 
        t('dns.autoUpdateDisabled');
      showSuccessToast(message);
    } catch (error) {
      handleApiError(error, 'DDNS 설정 변경 오류');
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
        <Header user={user} onLogout={handleLogout} />
        
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {tDns('recordsCount', { count: records.length })}
                    </h3>
                    <button 
                      onClick={() => setAddRecordModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {tDns('addRecord')}
                    </button>
                  </div>

                  {records.map((record) => (
                    <div key={record.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-700">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium text-gray-900 dark:text-white text-lg">{record.name}</span>
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md">
                                  {record.type}
                                </span>
                                {record.proxied && (
                                  <span className="px-2 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-md">
                                    Proxied
                                  </span>
                                )}
                                {record.autoUpdate && (
                                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-md">
                                    {tDns('ddnsActive')}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 mb-1">{record.content}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">TTL: {record.ttl}s</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
    </>
  );
}
