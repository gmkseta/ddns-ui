'use client';

import { useTranslations } from 'next-intl';
import { APIKey, Zone } from '@/utils/api';

interface DNSConfigSectionProps {
  apiKeys: APIKey[];
  zones: Zone[];
  selectedApiKey: string;
  selectedZone: string;
  zonesLoading: boolean;
  recordsLoading: boolean;
  onApiKeyChange: (apiKeyId: string) => void;
  onZoneChange: (zoneId: string) => void;
  onReload: () => void;
}

export default function DNSConfigSection({
  apiKeys,
  zones,
  selectedApiKey,
  selectedZone,
  zonesLoading,
  recordsLoading,
  onApiKeyChange,
  onZoneChange,
  onReload,
}: DNSConfigSectionProps) {
  const t = useTranslations();
  const tDns = useTranslations('dns');

  return (
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{tDns('management')}</h2>
        <button
          onClick={onReload}
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
          <span>{t('common.refresh')}</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API 키 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {tDns('apiKeySelect')}
          </label>
          <select
            value={selectedApiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{tDns('selectApiKey')}</option>
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
            {tDns('zoneSelect')}
          </label>
          <select
            value={selectedZone}
            onChange={(e) => onZoneChange(e.target.value)}
            disabled={zonesLoading || !selectedApiKey}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-600"
          >
            <option value="">
              {zonesLoading ? tDns('loadingZones') : tDns('selectZone')}
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
  );
}