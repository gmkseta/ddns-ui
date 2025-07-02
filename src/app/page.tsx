'use client';

import { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import ExportImportModal from '@/components/ExportImportModal';
import AddRecordModal from '@/components/AddRecordModal';
import { showToast } from '@/components/Toast';

interface User {
  username: string;
}

interface APIKey {
  id: string;
  token: string;
  name?: string;
}

interface Zone {
  id: string;
  name: string;
}

interface DNSRecord {
  id: string;
  name: string;
  type: string;
  content: string;
  ttl: number;
  proxied: boolean;
  autoUpdate?: boolean;
}

// 로컬 스토리지 키들
const STORAGE_KEYS = {
  selectedApiKey: 'ddns-ui-selected-api-key',
  selectedZone: 'ddns-ui-selected-zone',
};

export default function Home() {
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
  
  // 정렬 상태 (기본: DDNS 활성화된 것들 먼저)
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'content' | 'ttl' | 'autoUpdate'>('autoUpdate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // DNS 레코드 관리 상태
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [selectedApiKey, setSelectedApiKey] = useState<string>('');
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(false);

  // 현재 사용자 정보 확인
  useEffect(() => {
    checkAuth();
  }, []);

  // 로그인 후 API 키 로드
  useEffect(() => {
    if (user) {
      loadApiKeys();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    setLoginLoading(true);
    setLoginError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
      } else {
        setLoginError(data.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      // 상태 초기화
      setApiKeys([]);
      setSelectedApiKey('');
      setZones([]);
      setSelectedZone('');
      setRecords([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // API 키 목록 로드
  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/config/apikey');
      if (response.ok) {
        const data = await response.json();
        const apiKeyList = data.apiKeys || [];
        setApiKeys(apiKeyList);
        
        // 자동 선택 로직
        if (apiKeyList.length > 0) {
          // 이전에 선택한 API 키가 있는지 확인
          const savedApiKey = localStorage.getItem(STORAGE_KEYS.selectedApiKey);
          const validSavedKey = savedApiKey && apiKeyList.find((key: APIKey) => key.id === savedApiKey);
          
          // 이전 선택이 유효하면 그것을 사용, 아니면 첫 번째 키 사용
          const keyToSelect = validSavedKey ? savedApiKey : apiKeyList[0].id;
          
          // API 키 선택과 Zone 로드를 순차적으로 실행
          await selectApiKeyAndLoadZones(keyToSelect);
        }
      }
    } catch (error) {
      console.error('API 키 로드 오류:', error);
    }
  };

  // API 키 선택과 Zone 로드를 함께 처리하는 함수
  const selectApiKeyAndLoadZones = async (apiKeyId: string) => {
    setSelectedApiKey(apiKeyId);
    setSelectedZone('');
    setRecords([]);
    
    // 로컬 스토리지에 저장
    if (apiKeyId) {
      localStorage.setItem(STORAGE_KEYS.selectedApiKey, apiKeyId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.selectedApiKey);
    }
    
    if (!apiKeyId) {
      setZones([]);
      return;
    }

    setZonesLoading(true);
    try {
      const response = await fetch(`/api/zones?apiKeyId=${apiKeyId}`);
      if (response.ok) {
        const data = await response.json();
        const zoneList = data.zones || [];
        setZones(zoneList);
        
        // 자동 Zone 선택
        if (zoneList.length > 0) {
          // 이전에 선택한 Zone이 있는지 확인
          const savedZone = localStorage.getItem(STORAGE_KEYS.selectedZone);
          const validSavedZone = savedZone && zoneList.find((zone: Zone) => zone.id === savedZone);
          
          // 이전 선택이 유효하면 그것을 사용, 아니면 첫 번째 Zone 사용
          const zoneToSelect = validSavedZone ? savedZone : zoneList[0].id;
          
          // Zone 선택과 레코드 로드
          await selectZoneAndLoadRecords(zoneToSelect, apiKeyId);
        }
      } else {
        setZones([]);
        showToast.error('Zone 목록을 불러오는데 실패했습니다.', '🌐');
      }
    } catch (error) {
      console.error('Zone 로드 오류:', error);
      setZones([]);
      showToast.error('Zone 목록을 불러오는데 실패했습니다.', '🌐');
    } finally {
      setZonesLoading(false);
    }
  };

  // Zone 선택과 레코드 로드를 함께 처리하는 함수
  const selectZoneAndLoadRecords = async (zoneId: string, apiKeyId?: string) => {
    setSelectedZone(zoneId);
    setRecords([]);
    
    // 로컬 스토리지에 저장
    if (zoneId) {
      localStorage.setItem(STORAGE_KEYS.selectedZone, zoneId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.selectedZone);
    }
    
    const currentApiKey = apiKeyId || selectedApiKey;
    if (!zoneId || !currentApiKey) return;

    setRecordsLoading(true);
    try {
      const response = await fetch(`/api/records?zoneId=${zoneId}&apiKeyId=${currentApiKey}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
      } else {
        setRecords([]);
        showToast.error('DNS 레코드를 불러오는데 실패했습니다.', '📋');
      }
    } catch (error) {
      console.error('레코드 로드 오류:', error);
      setRecords([]);
      showToast.error('DNS 레코드를 불러오는데 실패했습니다.', '📋');
    } finally {
      setRecordsLoading(false);
    }
  };

  // API 키 선택 시 Zone 목록 로드 (사용자가 직접 선택할 때)
  const handleApiKeyChange = async (apiKeyId: string) => {
    await selectApiKeyAndLoadZones(apiKeyId);
  };

  // Zone 선택 시 레코드 목록 로드 (사용자가 직접 선택할 때)
  const handleZoneChange = async (zoneId: string) => {
    await selectZoneAndLoadRecords(zoneId);
  };

  // 전체 데이터 새로고침
  const handleReload = async () => {
    // 현재 선택된 API 키로 전체 데이터 새로고침
    if (selectedApiKey) {
      await selectApiKeyAndLoadZones(selectedApiKey);
    } else {
      // API 키가 없으면 API 키부터 다시 로드
      await loadApiKeys();
    }
  };

  // IP 조회 함수
  const fetchCurrentIP = async () => {
    setIpLoading(true);
    setIpError('');

    try {
      const response = await fetch('/api/ip');
      const data = await response.json();

      if (response.ok) {
        setCurrentIP(data.ip);
      } else {
        setIpError(data.error || 'IP 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('IP fetch error:', error);
      setIpError('IP 조회 중 오류가 발생했습니다.');
    } finally {
      setIpLoading(false);
    }
  };

  // 정렬 함수
  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      // 같은 필드 클릭시 방향 변경
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // 다른 필드 클릭시 해당 필드로 오름차순 정렬
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // 정렬된 레코드 배열
  const sortedRecords = [...records].sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];
    
    // autoUpdate의 경우 boolean을 숫자로 변환
    if (sortBy === 'autoUpdate') {
      aValue = a.autoUpdate ? 1 : 0;
      bValue = b.autoUpdate ? 1 : 0;
    }
    
    // TTL의 경우 숫자 정렬
    if (sortBy === 'ttl') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }
    
    // 문자열의 경우 대소문자 구분 없이 정렬
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // DDNS 수동 갱신 함수
  const handleDDNSUpdate = async () => {
    setDdnsLoading(true);

    try {
      const response = await fetch('/api/ddns/update', {
        method: 'POST',
      });
      
      const data = await response.json();

      if (response.ok) {
        // 결과 상세 정보 생성
        let message = `🔄 DDNS 갱신 완료!\n\n`;
        message += `📍 현재 IP: ${data.currentIP}\n`;
        message += `📊 총 ${data.totalRecords}개 레코드 중 ${data.totalUpdated}개 업데이트됨\n`;
        
        if (data.totalErrors > 0) {
          message += `❌ 오류: ${data.totalErrors}개\n`;
        }

        // CNAME → A 변환 정보 추가
        const convertedRecords = data.results?.filter((r: any) => r.typeChanged) || [];
        if (convertedRecords.length > 0) {
          message += `\n🔄 CNAME → A 레코드 변환:\n`;
          convertedRecords.forEach((r: any) => {
            message += `  • ${r.name}: ${r.oldContent} → ${r.newContent}\n`;
          });
        }

        // 상세 결과 표시
        if (data.results && data.results.length > 0) {
          message += `\n📋 상세 결과:\n`;
          data.results.forEach((result: any) => {
            const statusIcon = result.status === 'updated' ? '✅' : 
                             result.status === 'skipped' ? '⏭️' : '❌';
            message += `  ${statusIcon} ${result.name}: ${result.message}\n`;
          });
        }

        showToast.success(message, '🔄');
        
        // 레코드 목록 새로고침
        if (selectedZone && selectedApiKey) {
          await selectZoneAndLoadRecords(selectedZone);
        }
      } else {
        showToast.error(`DDNS 갱신 실패: ${data.error}`, '❌');
      }
    } catch (error) {
      console.error('DDNS update error:', error);
      showToast.error('DDNS 갱신 중 오류가 발생했습니다.', '⚠️');
    } finally {
      setDdnsLoading(false);
    }
  };

  // DDNS 자동 갱신 설정 토글
  const handleAutoUpdateToggle = async (recordId: string, currentValue: boolean) => {
    try {
      const record = records.find(r => r.id === recordId);
      if (!record) return;

      const response = await fetch('/api/records', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordId: record.id,
          zoneId: selectedZone,
          name: record.name,
          type: record.type,
          content: record.content,
          ttl: record.ttl,
          proxied: record.proxied,
          autoUpdate: !currentValue,
        }),
      });

      if (response.ok) {
        // 로컬 상태 업데이트
        setRecords(prev => prev.map(r => 
          r.id === recordId 
            ? { ...r, autoUpdate: !currentValue }
            : r
        ));
      } else {
        showToast.error('DDNS 설정 변경에 실패했습니다.', '⚙️');
      }
    } catch (error) {
      console.error('DDNS 설정 변경 오류:', error);
      showToast.error('DDNS 설정 변경 중 오류가 발생했습니다.', '⚠️');
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
        {/* 헤더 */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Cloudflare DDNS Manager
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user.username}님
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 상단 위젯들 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 현재 IP 확인 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">현재 IP</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">공인 IP 주소 확인</p>
                </div>
                <button
                  onClick={fetchCurrentIP}
                  disabled={ipLoading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {ipLoading ? '조회중...' : '조회'}
                </button>
              </div>
              
              {ipError && (
                <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
                  {ipError}
                </div>
              )}
              
              {ipLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">IP 확인 중...</span>
                </div>
              ) : currentIP ? (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">현재 공인 IP</p>
                  <p className="font-mono text-lg font-bold text-gray-900 dark:text-white">{currentIP}</p>
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">조회 버튼을 눌러주세요</p>
                </div>
              )}
            </div>

            {/* API 키 상태 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API 키</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {apiKeys.length}개 등록됨
                  </p>
                </div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
            </div>

            {/* 자동 갱신 상태 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">자동 갱신</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {records.filter(r => r.autoUpdate).length}개 활성
                  </p>
                </div>
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* DNS 레코드 관리 메인 콘텐츠 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* 설정 섹션 */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">DNS 레코드 관리</h2>
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
                  <span>새로고침</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* API 키 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API 키 선택
                  </label>
                  <select
                    value={selectedApiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">API 키를 선택하세요</option>
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
                    Zone 선택
                  </label>
                  <select
                    value={selectedZone}
                    onChange={(e) => handleZoneChange(e.target.value)}
                    disabled={zonesLoading || !selectedApiKey}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-600"
                  >
                    <option value="">
                      {zonesLoading ? 'Zone 목록 로딩 중...' : 'Zone을 선택하세요'}
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
                    🔄 DDNS 자동 갱신 기능
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    • <strong>DDNS 토글</strong>을 켜면 해당 레코드가 자동으로 현재 공인 IP로 갱신됩니다<br />
                    • <strong>CNAME 레코드</strong>는 자동으로 <strong>A 레코드</strong>로 변환되어 IP 주소로 설정됩니다<br />
                    • <strong>Proxied CNAME</strong>은 변환 시 자동으로 <strong>Proxy가 비활성화</strong>됩니다 (Cloudflare 제약)<br />
                    • 5분마다 IP 변경을 확인하며, 변경된 경우에만 업데이트를 수행합니다<br />
                    • 수동으로 즉시 갱신하려면 아래의 "DDNS 즉시 갱신" 버튼을 사용하세요
                  </p>
                </div>
              </div>
            </div>

            {/* 레코드 목록 */}
            <div className="p-6">
              {!selectedZone ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>API 키와 Zone을 선택하면 DNS 레코드가 표시됩니다.</p>
                </div>
              ) : recordsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-3 text-gray-600 dark:text-gray-300">레코드 로딩 중...</span>
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>레코드가 없습니다.</p>
                  <p className="text-sm">Cloudflare에서 DNS 레코드를 추가해주세요.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        DNS 레코드 ({records.length}개)
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">정렬:</span>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="name">이름</option>
                          <option value="type">타입</option>
                          <option value="content">내용</option>
                          <option value="ttl">TTL</option>
                          <option value="autoUpdate">DDNS 상태</option>
                        </select>
                        <button
                          onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          title={sortDirection === 'asc' ? '내림차순으로 변경' : '오름차순으로 변경'}
                        >
                          <svg 
                            className={`w-4 h-4 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleDDNSUpdate}
                        disabled={ddnsLoading}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        <svg 
                          className={`w-4 h-4 ${ddnsLoading ? 'animate-spin' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>{ddnsLoading ? 'DDNS 갱신 중...' : 'DDNS 즉시 갱신'}</span>
                      </button>
                      
                      {/* Export/Import 버튼들 */}
                      <button
                        onClick={openExportModal}
                        className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Export</span>
                      </button>
                      <button
                        onClick={openImportModal}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Import</span>
                      </button>
                      
                      <button 
                        onClick={() => setAddRecordModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        레코드 추가
                      </button>
                    </div>
                  </div>

                  {sortedRecords.map((record) => (
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
                                    DDNS 활성
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 mb-1">{record.content}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">TTL: {record.ttl}s</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          {/* DDNS 자동 갱신 토글 */}
                          <div className="flex flex-col items-center space-y-1">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">DDNS 자동갱신</span>
                              <button
                                onClick={() => handleAutoUpdateToggle(record.id, record.autoUpdate || false)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                                  record.autoUpdate 
                                    ? 'bg-purple-600 hover:bg-purple-700' 
                                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                }`}
                                title={record.type === 'CNAME' 
                                  ? '켜면 A 레코드로 변환하여 IP로 자동 갱신' 
                                  : '켜면 IP 변경시 자동 갱신'
                                }
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    record.autoUpdate ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                            {record.type === 'CNAME' && (
                              <div className="text-xs text-center">
                                <span className="text-orange-600 dark:text-orange-400 whitespace-nowrap block">
                                  A 레코드로 변환됨
                                </span>
                                {record.proxied && (
                                  <span className="text-red-600 dark:text-red-400 whitespace-nowrap block mt-0.5">
                                    Proxy 비활성화됨
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* 기존 편집/삭제 버튼 */}
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
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
