'use client';

import { useState } from 'react';

interface IPCheckerProps {
  onClose: () => void;
}

export default function IPChecker({ onClose }: IPCheckerProps) {
  const [currentIP, setCurrentIP] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCurrentIP = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ip');
      const data = await response.json();

      if (response.ok) {
        setCurrentIP(data.ip);
      } else {
        setError(data.error || 'IP 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('IP fetch error:', error);
      setError('IP 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              </div>
              <h2 className="text-xl font-bold">현재 IP 확인</h2>
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

        {/* 내용 */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="text-center">
              {loading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-200 dark:border-orange-700 border-t-orange-500 dark:border-t-orange-400"></div>
                  <span className="text-gray-600 dark:text-gray-300">IP 주소를 확인하는 중...</span>
                </div>
              ) : currentIP ? (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">현재 공인 IP 주소</p>
                  <p className="text-3xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">{currentIP}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">실시간으로 확인된 IP 주소입니다</p>
                </div>
              ) : (
                <div className="py-8">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">IP 확인 버튼을 눌러주세요</p>
                </div>
              )}
            </div>

            <button
              onClick={fetchCurrentIP}
              disabled={loading}
              className="w-full py-4 bg-orange-500 dark:bg-orange-600 text-white rounded-2xl font-semibold hover:bg-orange-600 dark:hover:bg-orange-500 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {loading ? '확인 중...' : currentIP ? '다시 확인' : 'IP 확인하기'}
            </button>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              이 IP는 Cloudflare DNS 레코드 업데이트에 사용됩니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 