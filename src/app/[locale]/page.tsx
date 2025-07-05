'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import LoginForm from '@/components/LoginForm';
import Header from '@/components/Header';
import StatusCards from '@/components/StatusCards';
import ExportImportModal from '@/components/ExportImportModal';
import AddRecordModal from '@/components/AddRecordModal';
import EditRecordModal from '@/components/EditRecordModal';
import DNSTabNavigation from '@/components/DNSTabNavigation';
import Footer from '@/components/Footer';

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
      console.error('레코드 로드 중 오류:', error);
      // 401/403 에러는 인증 문제이므로 별도 처리
      if (error instanceof Error && !error.message.includes('401') && !error.message.includes('403')) {
        handleApiError(error, '레코드 로드 오류');
      }
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
      console.error('Zone 로드 중 오류:', error);
      // 401/403 에러는 인증 문제이므로 별도 처리
      if (error instanceof Error && !error.message.includes('401') && !error.message.includes('403')) {
        handleApiError(error, 'Zone 로드 오류');
      }
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
      } else {
        // API 키가 없는 경우 localStorage 정리 (이것은 정상적인 상태)
        setSelectedApiKey('');
        setSelectedZone('');
        // API 키가 없는 것은 에러가 아니므로 토스트 메시지를 표시하지 않음
      }
    } catch (error) {
      // 네트워크 에러나 서버 에러 등 실제 에러만 처리
      console.error('API 키 로드 중 오류:', error);
      // 401 에러는 인증 문제이므로 별도 처리 (페이지 리로드됨)
      // 빈 배열이 반환되는 것은 정상이므로 에러로 처리하지 않음
      if (error instanceof Error && !error.message.includes('401') && !error.message.includes('403')) {
        handleApiError(error, 'API 키 로드 오류');
      }
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

          {/* DNS 관리 메인 콘텐츠 (탭 네비게이션 포함) */}
          <DNSTabNavigation
            apiKeys={apiKeys}
            zones={zones}
            records={records}
            sortedRecords={sortedRecords}
            currentIP={currentIP}
            selectedApiKey={selectedApiKey}
            selectedZone={selectedZone}
            zonesLoading={zonesLoading}
            recordsLoading={recordsLoading}
            ddnsLoading={ddnsLoading}
            onApiKeyChange={handleApiKeyChange}
            onZoneChange={handleZoneChange}
            onReload={handleReload}
            onSort={handleSort}
            onAddRecord={() => setAddRecordModal(true)}
            onEditRecord={openEditModal}
            onAutoUpdateToggle={handleAutoUpdateToggle}
            onDDNSUpdate={handleDDNSUpdate}
            getRecordSyncStatus={getRecordSyncStatus}
          />
        </div>
        
        {/* Footer */}
        <Footer />
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
