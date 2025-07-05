'use client';

import { useState, useEffect, useCallback } from 'react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'export' | 'import';
}

export default function ExportImportModal({ isOpen, onClose, mode }: ExportImportModalProps) {
  const [jsonData, setJsonData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [includeLogs, setIncludeLogs] = useState(true);

  // Export 데이터 로드
  const handleExport = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const url = `/api/export?includeLogs=${includeLogs}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setJsonData(JSON.stringify(data, null, 2));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Export에 실패했습니다.');
      }
    } catch (error) {
      console.error('Export error:', error);
      setError('Export 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [includeLogs]);

  // Import 실행
  const handleImport = async () => {
    if (!jsonData.trim()) {
      setError('JSON 데이터를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const parsedData = JSON.parse(jsonData);
      
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(`✅ Import 성공!\n\n• API 키: ${result.imported.apiKeys}개\n• Zone: ${result.imported.zones}개\n• 레코드: ${result.imported.records}개\n• 설정: ${result.imported.settings}개`);
        setTimeout(() => {
          onClose();
          window.location.reload(); // 페이지 새로고침
        }, 2000);
      } else {
        setError(result.error || 'Import에 실패했습니다.');
      }
    } catch (error) {
      console.error('Import error:', error);
      if (error instanceof SyntaxError) {
        setError('잘못된 JSON 형식입니다. 형식을 확인해주세요.');
      } else {
        setError('Import 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // JSON 다운로드
  const handleDownload = () => {
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ddns-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 모달 열릴 때 Export 모드면 자동으로 데이터 로드
  const handleModalOpen = () => {
    if (mode === 'export') {
      handleExport();
    } else {
      setJsonData('');
      setError('');
      setSuccess('');
    }
  };

  // 모달이 열릴 때마다 초기화
  if (isOpen && !loading && !jsonData && mode === 'export') {
    handleModalOpen();
  }

  // includeLogs 상태가 변경될 때 자동으로 다시 export
  useEffect(() => {
    if (isOpen && mode === 'export' && jsonData) {
      handleExport();
    }
  }, [includeLogs, isOpen, mode, jsonData, handleExport]);

  if (!isOpen) return null;

    return (
    <>
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 z-40" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      ></div>
      
      {/* 모달 */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl px-2 sm:px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {mode === 'export' ? '📤 설정 내보내기' : '📥 설정 가져오기'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* 설명 */}
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  {mode === 'export' ? '내보내기 안내' : '가져오기 안내'}
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-line">
                  {mode === 'export'
                    ? '• 현재 설정을 JSON 형태로 미리보고 편집할 수 있습니다\n• API 토큰이 전체로 포함되니 안전하게 보관하세요\n• 편집 후 다운로드 버튼으로 파일을 저장하세요'
                    : '• JSON 형태의 설정 데이터를 붙여넣어 주세요\n• 기존 설정은 덮어쓰기됩니다\n• Import 후 페이지가 자동으로 새로고침됩니다'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Export 옵션 */}
          {mode === 'export' && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">내보내기 옵션</h4>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLogs}
                  onChange={(e) => setIncludeLogs(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  스케줄러 로그 포함 (최근 100개)
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                체크 해제 시 로그 없이 내보내기됩니다 (파일 크기 감소)
              </p>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* 성공 메시지 */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <pre className="text-sm whitespace-pre-wrap">{success}</pre>
              </div>
            </div>
          )}

          {/* JSON 편집 영역 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              JSON 데이터 {mode === 'export' ? '(편집 가능)' : ''}
            </label>
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder={
                mode === 'export'
                  ? '데이터를 로딩 중입니다...'
                  : 'JSON 형태의 설정 데이터를 붙여넣어 주세요'
              }
              className="w-full h-48 sm:h-64 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-xs sm:text-sm resize-none"
              disabled={loading}
            />
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between flex-shrink-0 space-y-2 sm:space-y-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
          >
            닫기
          </button>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            {mode === 'export' && (
              <>
                <button
                  onClick={handleExport}
                  disabled={loading}
                  className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 text-sm"
                >
                  <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="hidden sm:inline">{loading ? '로딩 중...' : '새로고침'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  disabled={loading || !jsonData}
                  className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">다운로드</span>
                </button>
              </>
            )}
            {mode === 'import' && (
              <button
                onClick={handleImport}
                disabled={loading || !jsonData.trim()}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 text-sm"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {loading ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  )}
                </svg>
                <span className="hidden sm:inline">{loading ? 'Import 중...' : 'Import 실행'}</span>
              </button>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
} 