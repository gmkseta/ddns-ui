'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { showToast } from '@/components/Toast';

interface DNSRecord {
  id: string;
  name: string;
  type: string;
  content: string;
  ttl: number;
  proxied: boolean;
  autoUpdate?: boolean;
}

interface EditRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedZone: string | null;
  selectedApiKey: string | null;
  record: DNSRecord | null;
  onRecordUpdated: () => void;
}

export default function EditRecordModal({ 
  isOpen, 
  onClose, 
  selectedZone, 
  selectedApiKey,
  record,
  onRecordUpdated 
}: EditRecordModalProps) {
  const t = useTranslations();
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

  // 레코드 데이터가 변경되면 폼 데이터 업데이트
  useEffect(() => {
    if (record) {
      setFormData({
        name: record.name,
        type: record.type,
        content: record.content,
        ttl: record.ttl,
        proxied: record.proxied,
        autoUpdate: record.autoUpdate || false,
      });
    }
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedZone || !selectedApiKey || !record) {
      showToast.error('Zone과 API 키를 선택해주세요.');
      return;
    }

    if (!formData.name || !formData.content) {
      showToast.error('이름과 내용을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/records', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordId: record.id,
          zoneId: selectedZone,
          apiKeyId: selectedApiKey,
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(t('modal.editRecord.updateSuccess'));
        onRecordUpdated();
        onClose();
      } else {
        showToast.error(data.error || t('modal.editRecord.updateError'));
      }
    } catch (error) {
      console.error('DNS 레코드 수정 오류:', error);
      showToast.error(t('modal.editRecord.updateErrorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      };
      
      // 타입이 변경되었고 proxied를 지원하지 않는 타입이면 proxied를 false로 설정
      if (field === 'type' && !['A', 'AAAA', 'CNAME'].includes(value as string)) {
        newData.proxied = false;
      }
      
      return newData;
    });
  };

  if (!isOpen || !record) return null;

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
            {t('modal.editRecord.title')}
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
              {t('modal.editRecord.nameLabel')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('modal.editRecord.namePlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('modal.editRecord.nameHelper')}
            </p>
          </div>

          {/* 타입 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('modal.editRecord.typeLabel')}
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
              {t('modal.editRecord.contentLabel')} *
            </label>
            <input
              type="text"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder={
                formData.type === 'A' ? '192.168.1.1' :
                formData.type === 'CNAME' ? 'example.com' :
                formData.type === 'MX' ? '10 mail.example.com' :
                t('modal.editRecord.contentPlaceholder')
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          {/* TTL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('modal.editRecord.ttlLabel')}
            </label>
            <select
              value={formData.ttl}
              onChange={(e) => handleInputChange('ttl', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={60}>{t('modal.editRecord.ttl1min')}</option>
              <option value={300}>{t('modal.editRecord.ttl5min')}</option>
              <option value={600}>{t('modal.editRecord.ttl10min')}</option>
              <option value={1800}>{t('modal.editRecord.ttl30min')}</option>
              <option value={3600}>{t('modal.editRecord.ttl1hour')}</option>
              <option value={86400}>{t('modal.editRecord.ttl1day')}</option>
            </select>
          </div>

          {/* Proxied - A, AAAA, CNAME 타입에서만 가능 */}
          {['A', 'AAAA', 'CNAME'].includes(formData.type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('modal.editRecord.proxiedLabel')}
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="proxied"
                  checked={formData.proxied}
                  onChange={(e) => handleInputChange('proxied', e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                />
                <label htmlFor="proxied" className="text-sm text-gray-700 dark:text-gray-300">
                  {t('modal.editRecord.proxiedCheckbox')}
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('modal.editRecord.proxiedHelper')}
              </p>
            </div>
          )}

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
              {t('modal.editRecord.autoUpdateCheckbox')}
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
                    {t('modal.editRecord.autoUpdateWarningTitle')}
                  </h4>
                  <p 
                    className="text-sm text-yellow-700 dark:text-yellow-300 mt-1"
                    dangerouslySetInnerHTML={{ __html: t('modal.editRecord.autoUpdateWarningContent') }}
                  />
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
              {t('common.cancel')}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                )}
              </svg>
              <span>{loading ? t('modal.editRecord.updating') : t('modal.editRecord.update')}</span>
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
} 