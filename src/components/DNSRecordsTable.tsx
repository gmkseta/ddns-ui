'use client';

import { useTranslations } from 'next-intl';
import { DNSRecord } from '@/utils/api';
import { SortField } from '@/utils/sort';

interface DNSRecordsTableProps {
  records: DNSRecord[];
  sortedRecords: DNSRecord[];
  currentIP: string | null;
  recordsLoading: boolean;
  ddnsLoading: boolean;
  selectedZone: string;
  selectedApiKey: string;
  onSort: (field: SortField) => void;
  onAddRecord: () => void;
  onEditRecord: (record: DNSRecord) => void;
  onAutoUpdateToggle: (recordId: string, currentValue: boolean) => void;
  onDDNSUpdate: () => void;
  getRecordSyncStatus: (record: DNSRecord) => 'synced' | 'notSynced' | 'notTarget' | 'noData';
}

export default function DNSRecordsTable({
  records,
  sortedRecords,
  currentIP,
  recordsLoading,
  ddnsLoading,
  selectedZone,
  selectedApiKey,
  onSort,
  onAddRecord,
  onEditRecord,
  onAutoUpdateToggle,
  onDDNSUpdate,
  getRecordSyncStatus,
}: DNSRecordsTableProps) {
  const t = useTranslations();
  const tDns = useTranslations('dns');

  if (recordsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">{tDns('loadingRecords')}</span>
      </div>
    );
  }

  if (!selectedZone) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">{tDns('selectZonePrompt')}</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">{tDns('noRecords')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더와 액션 버튼들 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {tDns('recordsCount', { count: records.length })}
        </h3>
        <div className="flex items-center space-x-3">
          {/* DDNS 수동 갱신 버튼 */}
          <button
            onClick={onDDNSUpdate}
            disabled={ddnsLoading || !selectedApiKey || !selectedZone || records.filter(r => r.autoUpdate).length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            title={records.filter(r => r.autoUpdate).length === 0 ? t('ddns.noAutoUpdateRecords') : ''}
          >
            <svg 
              className={`w-4 h-4 ${ddnsLoading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>
              {ddnsLoading 
                ? t('common.updating') 
                : `${tDns('updateDDNS')} (${records.filter(r => r.autoUpdate).length})`
              }
            </span>
          </button>
          
          {/* 레코드 추가 버튼 */}
          <button 
            onClick={onAddRecord}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>{tDns('addRecord')}</span>
          </button>
        </div>
      </div>

      {/* 테이블 헤더 (소팅 가능) */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-700 dark:text-gray-300">
          {/* 레코드 이름 */}
          <button
            onClick={() => onSort('name')}
            className="col-span-3 flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
          >
            <span>{tDns('recordName')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
          
          {/* 타입 */}
          <button
            onClick={() => onSort('type')}
            className="col-span-1 flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
          >
            <span>{tDns('type')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
          
          {/* 콘텐츠 */}
          <button
            onClick={() => onSort('content')}
            className="col-span-2 flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
          >
            <span>{tDns('content')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
          
          {/* TTL */}
          <button
            onClick={() => onSort('ttl')}
            className="col-span-1 flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
          >
            <span>TTL</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
          
          {/* DDNS 설정 */}
          <button
            onClick={() => onSort('autoUpdate')}
            className="col-span-2 flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center justify-center"
          >
            <span>{tDns('ddnsSetting')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
          
          {/* IP 반영상태 */}
          <button
            onClick={() => onSort('synced')}
            className="col-span-2 flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center justify-center"
          >
            <span>{tDns('ddnsSync')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
          
          {/* 액션 */}
          <div className="col-span-1 text-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('dns.actions')}</span>
          </div>
        </div>
      </div>

      {/* 레코드 목록 (정렬된 순서로) */}
      <div className="space-y-2">
        {sortedRecords.map((record) => (
          <div key={record.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* 레코드 이름 */}
              <div className="col-span-3">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{record.name}</span>
                  {record.proxied && (
                    <span className="px-2 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-md">
                      Proxied
                    </span>
                  )}
                </div>
              </div>
              
              {/* 타입 */}
              <div className="col-span-1">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md">
                  {record.type}
                </span>
              </div>
              
              {/* 콘텐츠 */}
              <div className="col-span-2">
                <span className="text-sm text-gray-600 dark:text-gray-300 font-mono break-all">{record.content}</span>
              </div>
              
              {/* TTL */}
              <div className="col-span-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">{record.ttl}s</span>
              </div>
              
              {/* DDNS 설정 토글 */}
              <div className="col-span-2 flex items-center justify-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={record.autoUpdate || false}
                    onChange={() => onAutoUpdateToggle(record.id, !!record.autoUpdate)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    {record.autoUpdate ? tDns('ddnsActive') : tDns('ddnsInactive')}
                  </span>
                </label>
              </div>
              
              {/* IP 반영상태 */}
              <div className="col-span-2 flex items-center justify-center">
                {(() => {
                  const syncStatus = getRecordSyncStatus(record);
                  
                  switch (syncStatus) {
                    case 'synced':
                      return (
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {tDns('synced')}
                        </span>
                      );
                      
                    case 'notSynced':
                      return (
                        <span 
                          className="inline-flex items-center px-3 py-1 text-sm font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full"
                          title={`현재 IP: ${currentIP || 'N/A'}, 레코드 IP: ${record.content}`}
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          {tDns('notSynced')}
                        </span>
                      );
                      
                    case 'notTarget':
                      return (
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          {tDns('notTarget')}
                        </span>
                      );
                      
                    case 'noData':
                    default:
                      return (
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                          </svg>
                          {tDns('checkingIP')}
                        </span>
                      );
                  }
                })()}
              </div>
              
              {/* 액션 버튼 */}
              <div className="col-span-1 flex items-center justify-center">
                <button
                  onClick={() => onEditRecord(record)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title={t('modal.editRecord.title')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}