'use client';

import { useState, useEffect } from 'react';
import CustomSelect from './CustomSelect';

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
}

export default function DNSRecordPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [selectedApiKey, setSelectedApiKey] = useState<string>('');
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(false);
  
  // API 키 추가 상태
  const [showAddApiKey, setShowAddApiKey] = useState(false);
  const [apiKeyName, setApiKeyName] = useState('');
  const [apiKeyToken, setApiKeyToken] = useState('');
  const [addingApiKey, setAddingApiKey] = useState(false);

  // API 키 목록 로드
  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      console.log('API 키 로딩 시작...');
      const response = await fetch('/api/config/apikey');
      console.log('API 응답 상태:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API 응답 데이터:', data);
        setApiKeys(data.apiKeys || []);
        console.log('설정된 API 키들:', data.apiKeys || []);
      } else {
        console.log('API 응답 실패:', response.status);
      }
    } catch (error) {
      console.error('API 키 로드 오류:', error);
    }
  };

  // API 키 추가
  const handleAddApiKey = async () => {
    if (!apiKeyToken.trim()) {
      alert('API 토큰을 입력해주세요.');
      return;
    }

    setAddingApiKey(true);
    try {
      const response = await fetch('/api/config/apikey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: apiKeyName.trim() || undefined,
          token: apiKeyToken.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API 키 추가 응답:', data);
        await loadApiKeys(); // API 키 목록 새로고침
        setSelectedApiKey(data.id); // 새로 추가된 API 키 선택
        setShowAddApiKey(false);
        setApiKeyName('');
        setApiKeyToken('');
        alert('API 키가 성공적으로 추가되었습니다.');
      } else {
        const data = await response.json();
        console.log('API 키 추가 실패:', data);
        alert(`API 키 추가 실패: ${data.error}`);
      }
    } catch (error) {
      console.error('API 키 추가 오류:', error);
      alert('API 키 추가 중 오류가 발생했습니다.');
    } finally {
      setAddingApiKey(false);
    }
  };

  // API 키 선택 시 Zone 목록 로드
  const handleApiKeyChange = async (apiKeyId: string) => {
    setSelectedApiKey(apiKeyId);
    setSelectedZone('');
    setRecords([]);
    
    if (!apiKeyId) {
      setZones([]);
      return;
    }

    setZonesLoading(true);
    try {
      const response = await fetch(`/api/zones?apiKeyId=${apiKeyId}`);
      if (response.ok) {
        const data = await response.json();
        setZones(data.zones || []);
      } else {
        setZones([]);
        alert('Zone 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Zone 로드 오류:', error);
      setZones([]);
      alert('Zone 목록을 불러오는데 실패했습니다.');
    } finally {
      setZonesLoading(false);
    }
  };

  // Zone 선택 시 레코드 목록 로드
  const handleZoneChange = async (zoneId: string) => {
    setSelectedZone(zoneId);
    setRecords([]);
    
    if (!zoneId || !selectedApiKey) return;

    setRecordsLoading(true);
    try {
      const response = await fetch(`/api/records?zoneId=${zoneId}&apiKeyId=${selectedApiKey}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
      } else {
        setRecords([]);
        alert('DNS 레코드를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('레코드 로드 오류:', error);
      setRecords([]);
      alert('DNS 레코드를 불러오는데 실패했습니다.');
    } finally {
      setRecordsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DNS 레코드 관리</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">API 키를 선택하고 Zone과 DNS 레코드를 통합 관리하세요</p>
          </div>
        </div>
      </div>

      {/* API 키 및 Zone 선택 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">설정 선택</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* API 키 선택 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                API 키 선택
              </label>
              <button
                onClick={() => setShowAddApiKey(!showAddApiKey)}
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium"
              >
                {showAddApiKey ? '취소' : '+ 새 API 키 추가'}
              </button>
            </div>
            
            {!showAddApiKey ? (
              <CustomSelect
                options={apiKeys.map(key => ({
                  value: key.id,
                  label: key.name || `API Key`,
                  description: `${key.token.substring(0, 8)}...${key.token.substring(key.token.length - 4)}`
                }))}
                value={selectedApiKey}
                onChange={handleApiKeyChange}
                placeholder="API 키를 선택하세요"
                searchable={true}
              />
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="API 키 이름 (선택사항)"
                  value={apiKeyName}
                  onChange={(e) => setApiKeyName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <input
                  type="password"
                  placeholder="Cloudflare API 토큰"
                  value={apiKeyToken}
                  onChange={(e) => setApiKeyToken(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddApiKey}
                  disabled={addingApiKey || !apiKeyToken.trim()}
                  className="w-full px-4 py-3 bg-purple-600 dark:bg-purple-700 text-white rounded-xl hover:bg-purple-700 dark:hover:bg-purple-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {addingApiKey ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>추가 중...</span>
                    </>
                  ) : (
                    <span>API 키 추가</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Zone 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Zone 선택
            </label>
            <CustomSelect
              options={zones.map(zone => ({
                value: zone.id,
                label: zone.name,
                description: `Zone ID: ${zone.id.substring(0, 8)}...`
              }))}
              value={selectedZone}
              onChange={handleZoneChange}
              placeholder={
                !selectedApiKey 
                  ? '먼저 API 키를 선택하세요'
                  : zonesLoading 
                  ? 'Zone 목록 로딩 중...' 
                  : 'Zone을 선택하세요'
              }
              disabled={!selectedApiKey || zonesLoading}
              searchable={true}
            />
          </div>
        </div>
      </div>

      {/* DNS 레코드 관리 */}
      {selectedZone && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">DNS 레코드</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                {zones.find(z => z.id === selectedZone)?.name} Zone의 DNS 레코드 목록
              </p>
            </div>
            <button className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-xl hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>레코드 추가</span>
            </button>
          </div>

          {recordsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center space-x-3">
                <svg className="animate-spin w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-600 dark:text-gray-300">레코드 로딩 중...</span>
              </div>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">레코드가 없습니다</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">첫 번째 DNS 레코드를 추가해보세요.</p>
              <button className="px-6 py-3 bg-purple-600 dark:bg-purple-700 text-white rounded-xl hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors">
                첫 레코드 추가하기
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{record.name}</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-md">
                          {record.type}
                        </span>
                        {record.proxied && (
                          <span className="px-2 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-md">
                            Proxied
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">{record.content}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">TTL: {record.ttl}초</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* API 키가 없는 경우 안내 */}
      {apiKeys.length === 0 && !showAddApiKey && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.414-6.414A6 6 0 0721 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">API 키가 필요합니다</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">DNS 레코드를 관리하려면 먼저 Cloudflare API 키를 등록해야 합니다.</p>
            <button 
              onClick={() => setShowAddApiKey(true)}
              className="px-6 py-3 bg-purple-600 dark:bg-purple-700 text-white rounded-xl hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
            >
              API 키 등록하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 