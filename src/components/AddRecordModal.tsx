'use client';

import { useState } from 'react';
import { showToast } from '@/components/Toast';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedZone: string | null;
  selectedApiKey: string | null;
  onRecordAdded: () => void;
}

export default function AddRecordModal({ 
  isOpen, 
  onClose, 
  selectedZone, 
  selectedApiKey,
  onRecordAdded 
}: AddRecordModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'A',
    content: '',
    ttl: 300,
    proxied: false,
    autoUpdate: false,
  });

  const recordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'PTR'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedZone || !selectedApiKey) {
      showToast.error('Zone과 API 키를 선택해주세요.', '⚙️');
      return;
    }

    if (!formData.name || !formData.content) {
      showToast.error('이름과 내용을 입력해주세요.', '📝');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zoneId: selectedZone,
          apiKeyId: selectedApiKey,
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success('DNS 레코드가 성공적으로 추가되었습니다!', '✨');
        setFormData({
          name: '',
          type: 'A',
          content: '',
          ttl: 300,
          proxied: false,
          autoUpdate: false,
        });
        onRecordAdded();
        onClose();
      } else {
        showToast.error(data.error || 'DNS 레코드 추가에 실패했습니다.', '❌');
      }
    } catch (error) {
      console.error('DNS 레코드 추가 오류:', error);
      showToast.error('DNS 레코드 추가 중 오류가 발생했습니다.', '⚠️');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

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
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 max-h-[80vh] overflow-hidden">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            ➕ DNS 레코드 추가
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

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이름 (Name) *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="예: www, api, mail"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              @ 기호는 루트 도메인을 의미합니다
            </p>
          </div>

          {/* 타입 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              타입 (Type)
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {recordTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              내용 (Content) *
            </label>
            <input
              type="text"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder={
                formData.type === 'A' ? '192.168.1.1' :
                formData.type === 'CNAME' ? 'example.com' :
                formData.type === 'MX' ? '10 mail.example.com' :
                '내용을 입력하세요'
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          {/* TTL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              TTL (초)
            </label>
            <select
              value={formData.ttl}
              onChange={(e) => handleInputChange('ttl', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={60}>1분 (60초)</option>
              <option value={300}>5분 (300초)</option>
              <option value={600}>10분 (600초)</option>
              <option value={1800}>30분 (1800초)</option>
              <option value={3600}>1시간 (3600초)</option>
              <option value={86400}>1일 (86400초)</option>
            </select>
          </div>

          {/* Proxied */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="proxied"
              checked={formData.proxied}
              onChange={(e) => handleInputChange('proxied', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="proxied" className="text-sm text-gray-700 dark:text-gray-300">
              Cloudflare Proxy 사용 (A, AAAA, CNAME 타입만)
            </label>
          </div>

          {/* Auto Update */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoUpdate"
              checked={formData.autoUpdate}
              onChange={(e) => handleInputChange('autoUpdate', e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
            />
            <label htmlFor="autoUpdate" className="text-sm text-gray-700 dark:text-gray-300">
              DDNS 자동 갱신 활성화
            </label>
          </div>

          {formData.autoUpdate && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    DDNS 자동 갱신 안내
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    • CNAME 레코드는 자동으로 A 레코드로 변환됩니다<br />
                    • Proxied CNAME은 변환 시 Proxy가 비활성화됩니다<br />
                    • 5분마다 IP 변경을 확인하여 자동 업데이트합니다
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {loading ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                )}
              </svg>
              <span>{loading ? '추가 중...' : '레코드 추가'}</span>
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
} 