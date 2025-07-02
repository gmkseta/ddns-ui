'use client';

import { useState, useEffect } from 'react';

interface APIKey {
  id: number;
  token: string;
  createdAt: string;
}

interface APIKeyManagerProps {
  onClose: () => void;
}

export default function APIKeyManager({ onClose }: APIKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [newToken, setNewToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      const response = await fetch('/api/config/apikey');
      const data = await response.json();

      if (response.ok) {
        setApiKeys(data.keys);
      } else {
        setError(data.error || 'API 키 목록 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('Fetch API keys error:', error);
      setError('API 키 목록 조회 중 오류가 발생했습니다.');
    } finally {
      setFetchLoading(false);
    }
  };

  const addAPIKey = async () => {
    if (!newToken.trim()) {
      setError('API 토큰을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/config/apikey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: newToken.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setNewToken('');
        await fetchAPIKeys();
      } else {
        setError(data.error || 'API 키 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Add API key error:', error);
      setError('API 키 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const deleteAPIKey = async (keyId: number) => {
    if (!confirm('이 API 키와 관련된 모든 데이터가 삭제됩니다. 계속하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/config/apikey?id=${keyId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        await fetchAPIKeys();
      } else {
        setError(data.error || 'API 키 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete API key error:', error);
      setError('API 키 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.414-6.414A6 6 0 0121 9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">API 키 관리</h2>
                <p className="text-blue-100 mt-1">Cloudflare API 토큰을 안전하게 관리하세요</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 스크롤 가능한 내용 */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-8 space-y-8">
            {/* 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl text-sm">
                {success}
              </div>
            )}

            {/* 새 API 키 추가 카드 */}
            <div className="bg-gray-50 rounded-3xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">새 API 키 추가</h3>
                  <p className="text-gray-600 text-sm mt-1">Cloudflare API 토큰을 등록하세요</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="apiToken" className="block text-sm font-semibold text-gray-700 mb-3">
                    API Token
                  </label>
                  <input
                    id="apiToken"
                    type="text"
                    value={newToken}
                    onChange={(e) => setNewToken(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 disabled:opacity-50 transition-all"
                    placeholder="Cloudflare API Token을 입력하세요"
                  />
                </div>
                <button
                  onClick={addAPIKey}
                  disabled={loading || !newToken.trim()}
                  className="w-full py-4 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      등록 중...
                    </div>
                  ) : (
                    'API 키 등록하기'
                  )}
                </button>
              </div>
            </div>

            {/* API 키 목록 */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">등록된 API 키</h3>
                  <p className="text-gray-600 text-sm mt-1">{apiKeys.length}개의 API 키가 등록되어 있습니다</p>
                </div>
              </div>

              {fetchLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-500"></div>
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">등록된 API 키가 없습니다</p>
                  <p className="text-gray-400 text-sm mt-1">위에서 새 API 키를 추가해주세요</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-200"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm text-gray-900 break-all">
                          {key.token.slice(0, 8)}{'*'.repeat(24)}{key.token.slice(-8)}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          등록일: {new Date(key.createdAt).toLocaleString('ko-KR')}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteAPIKey(key.id)}
                        className="ml-4 px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors text-sm font-medium"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 도움말 카드 */}
            <div className="bg-blue-50 rounded-3xl border border-blue-200 p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-blue-900">API Token 생성 방법</h4>
                  <p className="text-blue-700 text-sm mt-1">Cloudflare에서 API 토큰을 생성하는 방법입니다</p>
                </div>
              </div>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside leading-relaxed">
                <li>Cloudflare 대시보드에서 "My Profile" → "API Tokens" 이동</li>
                <li>"Create Token" 클릭</li>
                <li>"Custom token" 선택</li>
                <li>Zone:Read, DNS:Edit 권한 부여</li>
                <li>생성된 Token을 위 입력란에 복사하여 입력</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 