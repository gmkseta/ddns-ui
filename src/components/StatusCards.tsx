'use client';

import { useTranslations } from 'next-intl';

interface StatusCardsProps {
  currentIP: string | null;
  ipLoading: boolean;
  ipError: string;
  apiKeysCount: number;
  autoUpdateCount: number;
  onFetchIP: () => void;
}

export default function StatusCards({ 
  currentIP, 
  ipLoading, 
  ipError, 
  apiKeysCount, 
  autoUpdateCount, 
  onFetchIP 
}: StatusCardsProps) {
  const t = useTranslations();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* 현재 IP 확인 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('dashboard.currentIP')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t('dashboard.currentIPDesc')}
            </p>
          </div>
          <button
            onClick={onFetchIP}
            disabled={ipLoading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {ipLoading ? t('dashboard.checking') : t('dashboard.check')}
          </button>
        </div>
        
        {ipError && (
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
            {ipError}
          </div>
        )}
        
        {ipLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {t('dashboard.checkingIP')}
            </span>
          </div>
        ) : currentIP ? (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {t('dashboard.currentPublicIP')}
            </p>
            <p className="font-mono text-lg font-bold text-gray-900 dark:text-white">
              {currentIP}
            </p>
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('dashboard.clickToCheck')}
            </p>
          </div>
        )}
      </div>

      {/* API 키 상태 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('dashboard.apiKeys')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t('dashboard.apiKeysCount', { count: apiKeysCount })}
            </p>
          </div>
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        </div>
      </div>

      {/* 자동 갱신 상태 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('dashboard.autoUpdate')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t('dashboard.autoUpdateCount', { count: autoUpdateCount })}
            </p>
          </div>
          <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
} 