'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClockIcon, PlayIcon, StopIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface SchedulerLog {
  id: number;
  record_id: string;
  old_ip: string;
  new_ip: string;
  status: 'success' | 'error';
  message: string;
  trigger_type: 'auto' | 'manual';
  created_at: string;
  record_name: string;
  record_type: string;
  zone_name: string;
}

interface SchedulerStatus {
  isRunning: boolean;
  isUpdating: boolean;
  environment: string;
  updateInterval: number;
}

export default function SchedulerLogs() {
  const t = useTranslations('scheduler');
  const [page, setPage] = useState(0);
  const limit = 20;

  // 스케줄러 상태 조회
  const { data: statusData, refetch: refetchStatus } = useQuery<{ success: boolean; data: SchedulerStatus }>({
    queryKey: ['scheduler-status'],
    queryFn: async () => {
      const response = await fetch('/api/scheduler/status');
      const data = await response.json();
      return { success: response.ok, data };
    },
    refetchInterval: 5000, // 5초마다 상태 업데이트
  });

  // 스케줄러 로그 조회
  const { data: logsData, refetch: refetchLogs } = useQuery<{ 
    success: boolean; 
    logs: SchedulerLog[]; 
    total: number; 
  }>({
    queryKey: ['scheduler-logs', page],
    queryFn: async () => {
      const response = await fetch(`/api/scheduler/logs?limit=${limit}&offset=${page * limit}`);
      return response.json();
    },
    refetchInterval: 10000, // 10초마다 로그 업데이트
  });

  // 스케줄러 제어
  const handleSchedulerAction = async (action: 'start' | 'stop' | 'run') => {
    try {
      const response = await fetch('/api/scheduler/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const result = await response.json();
      
      if (result.success) {
        const messageKey = action === 'start' ? 'messages.startSuccess' : 
                          action === 'stop' ? 'messages.stopSuccess' : 
                          'messages.runSuccess';
        toast.success(t(messageKey));
        refetchStatus();
        if (action === 'run') {
          // 수동 실행 후 5초 후에 로그 새로고침
          setTimeout(() => refetchLogs(), 5000);
        }
      } else {
        toast.error(result.error || t('messages.error'));
      }
    } catch {
      toast.error(t('messages.networkError'));
    }
  };

  const formatDate = (dateString: string) => {
    // SQLite에서 UTC로 저장된 시간을 받아옴
    // 'Z'를 추가하여 UTC임을 명시
    const utcDate = new Date(dateString + 'Z');
    
    return utcDate.toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'success' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    return status === 'success' ? (
      <CheckCircleIcon className="h-5 w-5 text-green-600" />
    ) : (
      <XCircleIcon className="h-5 w-5 text-red-600" />
    );
  };

  const getTriggerTypeDisplay = (triggerType: 'auto' | 'manual') => {
    return triggerType === 'manual' ? (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500 text-white dark:bg-blue-600">
        {t('log.manual')}
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200">
        {t('log.auto')}
      </span>
    );
  };

  const status = statusData?.data;
  const logs = logsData?.logs || [];
  const total = logsData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* 스케줄러 상태 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            {t('title')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleSchedulerAction('run')}
              disabled={status?.isUpdating}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50"
            >
              <ArrowPathIcon className="h-4 w-4" />
              {t('actions.manualRun')}
            </button>
            {status?.isRunning ? (
              <button
                onClick={() => handleSchedulerAction('stop')}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <StopIcon className="h-4 w-4" />
                {t('actions.stop')}
              </button>
            ) : (
              <button
                onClick={() => handleSchedulerAction('start')}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30"
              >
                <PlayIcon className="h-4 w-4" />
                {t('actions.start')}
              </button>
            )}
          </div>
        </div>

        {status && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {status.isRunning ? t('status.running') : t('status.stopped')}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('status.schedulerStatus')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {status.isUpdating ? t('status.updating') : t('status.waiting')}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('status.updateStatus')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('status.minuteFormat', { minutes: status.updateInterval })}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('status.updateInterval')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {status.environment}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('status.environment')}</div>
            </div>
          </div>
        )}
      </div>

      {/* 스케줄러 로그 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('logsCount', { count: total })}
          </h2>
        </div>

        {logs.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            {t('log.noLogs')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {t('log.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {t('log.type')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {t('log.record')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {t('log.ipChange')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {t('log.time')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className={`text-sm font-medium ${getStatusColor(log.status)}`}>
                          {log.status === 'success' ? t('log.success') : t('log.failed')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTriggerTypeDisplay(log.trigger_type || 'auto')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {log.record_name}.{log.zone_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {t('log.recordType', { type: log.record_type })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 w-10">{t('log.previousIP')}</span>
                          <span className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                            {log.old_ip}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 w-10">{t('log.newIP')}</span>
                          <span className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded">
                            {log.new_ip}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {t('log.pagination', { 
                start: page * limit + 1, 
                end: Math.min((page + 1) * limit, total), 
                total 
              })}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                {t('log.previous')}
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                {t('log.next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}