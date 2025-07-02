'use client';

import { useState, useEffect } from 'react';

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

interface DNSRecordManagerProps {
  onClose: () => void;
}

// 로컬 스토리지 키들
const STORAGE_KEYS = {
  selectedApiKey: 'ddns-ui-selected-api-key',
  selectedZone: 'ddns-ui-selected-zone',
};

export default function DNSRecordManager({ onClose }: DNSRecordManagerProps) {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [selectedApiKey, setSelectedApiKey] = useState<string>('');
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(false);

  // API 키 목록 로드
  useEffect(() => {
    loadApiKeys();
  }, []);

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
          setSelectedApiKey(keyToSelect);
          handleApiKeyChange(keyToSelect);
        }
      }
    } catch (error) {
      console.error('API 키 로드 오류:', error);
    }
  };

  // API 키 선택 시 Zone 목록 로드
  const handleApiKeyChange = async (apiKeyId: string) => {
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
          setSelectedZone(zoneToSelect);
          handleZoneChange(zoneToSelect);
        }
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
    
    // 로컬 스토리지에 저장
    if (zoneId) {
      localStorage.setItem(STORAGE_KEYS.selectedZone, zoneId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.selectedZone);
    }
    
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
        alert('DDNS 설정 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('DDNS 설정 변경 오류:', error);
      alert('DDNS 설정 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">DNS 레코드 관리</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* API 키 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API 키 선택
            </label>
            <select
              value={selectedApiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          {selectedApiKey && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone 선택
              </label>
              <select
                value={selectedZone}
                onChange={(e) => handleZoneChange(e.target.value)}
                disabled={zonesLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
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
          )}

          {/* DNS 레코드 목록 */}
          {selectedZone && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">DNS 레코드</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  레코드 추가
                </button>
              </div>

              {recordsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-3 text-gray-600">레코드 로딩 중...</span>
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>레코드가 없습니다.</p>
                  <p className="text-sm">첫 번째 DNS 레코드를 추가해보세요.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {records.map((record) => (
                    <div key={record.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{record.name}</span>
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
                                  {record.type}
                                </span>
                                {record.proxied && (
                                  <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-md">
                                    Proxied
                                  </span>
                                )}
                                {record.autoUpdate && (
                                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md">
                                    DDNS 활성
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{record.content}</p>
                              <p className="text-xs text-gray-500 mt-1">TTL: {record.ttl}s</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {/* DDNS 자동 갱신 토글 */}
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-600 whitespace-nowrap">DDNS 자동갱신</span>
                            <button
                              onClick={() => handleAutoUpdateToggle(record.id, record.autoUpdate || false)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                record.autoUpdate 
                                  ? 'bg-green-600' 
                                  : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                  record.autoUpdate ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          
                          {/* 기존 편집/삭제 버튼 */}
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          )}
        </div>
      </div>
    </div>
  );
} 