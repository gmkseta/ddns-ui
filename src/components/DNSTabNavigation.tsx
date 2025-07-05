'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import SchedulerLogs from '@/components/SchedulerLogs';
import DNSConfigSection from '@/components/DNSConfigSection';
import DNSRecordsTable from '@/components/DNSRecordsTable';
import { APIKey, Zone, DNSRecord } from '@/utils/api';
import { SortField } from '@/utils/sort';

interface DNSTabNavigationProps {
  // DNS 관리 props
  apiKeys: APIKey[];
  zones: Zone[];
  records: DNSRecord[];
  sortedRecords: DNSRecord[];
  currentIP: string | null;
  selectedApiKey: string;
  selectedZone: string;
  zonesLoading: boolean;
  recordsLoading: boolean;
  ddnsLoading: boolean;
  
  // Event handlers
  onApiKeyChange: (apiKeyId: string) => void;
  onZoneChange: (zoneId: string) => void;
  onReload: () => void;
  onSort: (field: SortField) => void;
  onAddRecord: () => void;
  onEditRecord: (record: DNSRecord) => void;
  onAutoUpdateToggle: (recordId: string, currentValue: boolean) => void;
  onDDNSUpdate: () => void;
  getRecordSyncStatus: (record: DNSRecord) => 'synced' | 'notSynced' | 'notTarget' | 'noData';
}

export default function DNSTabNavigation({
  apiKeys,
  zones,
  records,
  sortedRecords,
  currentIP,
  selectedApiKey,
  selectedZone,
  zonesLoading,
  recordsLoading,
  ddnsLoading,
  onApiKeyChange,
  onZoneChange,
  onReload,
  onSort,
  onAddRecord,
  onEditRecord,
  onAutoUpdateToggle,
  onDDNSUpdate,
  getRecordSyncStatus,
}: DNSTabNavigationProps) {
  const tDns = useTranslations('dns');
  const [activeTab, setActiveTab] = useState<'records' | 'scheduler'>('records');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('records')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'records'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            DNS 레코드 관리
          </button>
          <button
            onClick={() => setActiveTab('scheduler')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'scheduler'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            스케줄러 로그
          </button>
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'records' ? (
        <>
          {/* DNS 설정 섹션 */}
          <DNSConfigSection
            apiKeys={apiKeys}
            zones={zones}
            selectedApiKey={selectedApiKey}
            selectedZone={selectedZone}
            zonesLoading={zonesLoading}
            recordsLoading={recordsLoading}
            onApiKeyChange={onApiKeyChange}
            onZoneChange={onZoneChange}
            onReload={onReload}
          />

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
                  {tDns('autoUpdateFeature')}
                </h4>
                <p 
                  className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: tDns('autoUpdateDescription') }}
                />
              </div>
            </div>
          </div>

          {/* DNS 레코드 테이블 */}
          <div className="p-6">
            <DNSRecordsTable
              records={records}
              sortedRecords={sortedRecords}
              currentIP={currentIP}
              recordsLoading={recordsLoading}
              ddnsLoading={ddnsLoading}
              selectedZone={selectedZone}
              selectedApiKey={selectedApiKey}
              onSort={onSort}
              onAddRecord={onAddRecord}
              onEditRecord={onEditRecord}
              onAutoUpdateToggle={onAutoUpdateToggle}
              onDDNSUpdate={onDDNSUpdate}
              getRecordSyncStatus={getRecordSyncStatus}
            />
          </div>
        </>
      ) : (
        <div className="p-6">
          <SchedulerLogs />
        </div>
      )}
    </div>
  );
}