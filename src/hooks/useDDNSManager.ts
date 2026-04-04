'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  getCurrentIP,
  getApiKeys,
  getZones,
  getRecords,
  updateDDNS,
  toggleDDNSAutoUpdate,
  APIKey,
  Zone,
  DNSRecord,
} from '@/utils/api';
import {
  getSelectedApiKey,
  setSelectedApiKey,
  getSelectedZone,
  setSelectedZone,
} from '@/utils/storage';
import { showSuccessToast, handleApiError } from '@/utils/toast';
import { formatErrorMessage } from '@/utils/format';

export function useDDNSManager() {
  const t = useTranslations();

  // IP 확인 상태
  const [currentIP, setCurrentIP] = useState<string | null>(null);
  const [ipLoading, setIpLoading] = useState(false);
  const [ipError, setIpError] = useState('');

  // DDNS 수동 갱신 상태
  const [ddnsLoading, setDdnsLoading] = useState(false);

  // DNS 레코드 관리 상태
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [selectedApiKey, setSelectedApiKeyState] = useState<string>('');
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZoneState] = useState<string>('');
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(false);

  // IP 확인 함수
  const fetchCurrentIP = useCallback(async () => {
    setIpLoading(true);
    setIpError('');
    try {
      const ip = await getCurrentIP();
      setCurrentIP(ip);
    } catch (error) {
      setIpError(formatErrorMessage(error));
    } finally {
      setIpLoading(false);
    }
  }, []);

  // Zone 선택과 레코드 로드를 함께 처리하는 함수
  const selectZoneAndLoadRecords = useCallback(async (zoneId: string, apiKeyId?: string) => {
    setSelectedZoneState(zoneId);
    setRecords([]);

    if (zoneId) {
      setSelectedZone(zoneId);
    } else {
      setSelectedZoneState('');
    }

    const keyToUse = apiKeyId || selectedApiKey;
    if (!zoneId || !keyToUse) return;

    setRecordsLoading(true);
    try {
      const recordList = await getRecords(zoneId, keyToUse);
      setRecords(recordList);
    } catch (error) {
      console.error('레코드 로드 중 오류:', error);
      if (error instanceof Error && !error.message.includes('401') && !error.message.includes('403')) {
        handleApiError(error, '레코드 로드 오류');
      }
    } finally {
      setRecordsLoading(false);
    }
  }, [selectedApiKey]);

  // API 키 선택과 Zone 로드를 함께 처리하는 함수
  const selectApiKeyAndLoadZones = useCallback(async (apiKeyId: string) => {
    setSelectedApiKeyState(apiKeyId);
    setSelectedZoneState('');
    setRecords([]);

    if (apiKeyId) {
      setSelectedApiKey(apiKeyId);
    } else {
      setSelectedApiKeyState('');
    }

    if (!apiKeyId) {
      setZones([]);
      return;
    }

    setZonesLoading(true);
    try {
      const zoneList = await getZones(apiKeyId);
      setZones(zoneList);

      if (zoneList.length > 0) {
        const savedZone = getSelectedZone();
        const validSavedZone = savedZone && zoneList.find((zone: Zone) => zone.id === savedZone);
        const zoneToSelect = validSavedZone ? savedZone : zoneList[0].id;
        await selectZoneAndLoadRecords(zoneToSelect, apiKeyId);
      }
    } catch (error) {
      console.error('Zone 로드 중 오류:', error);
      if (error instanceof Error && !error.message.includes('401') && !error.message.includes('403')) {
        handleApiError(error, 'Zone 로드 오류');
      }
    } finally {
      setZonesLoading(false);
    }
  }, [selectZoneAndLoadRecords]);

  // API 키 목록 로드
  const loadApiKeys = useCallback(async () => {
    try {
      const apiKeyList = await getApiKeys();
      setApiKeys(apiKeyList);

      if (apiKeyList.length > 0) {
        const savedApiKey = getSelectedApiKey();
        const validSavedKey = savedApiKey && apiKeyList.find((key: APIKey) => key.id === savedApiKey);
        const keyToSelect = validSavedKey ? savedApiKey : apiKeyList[0].id;
        await selectApiKeyAndLoadZones(keyToSelect);
      } else {
        setSelectedApiKey('');
        setSelectedZone('');
      }
    } catch (error) {
      console.error('API 키 로드 중 오류:', error);
      if (error instanceof Error && !error.message.includes('401') && !error.message.includes('403')) {
        handleApiError(error, 'API 키 로드 오류');
      }
    }
  }, [selectApiKeyAndLoadZones]);

  // DDNS 수동 갱신 함수
  const handleDDNSUpdate = useCallback(async () => {
    setDdnsLoading(true);
    try {
      const result = await updateDDNS(selectedApiKey);

      const updated = result.updated || [];
      const errors = result.errors || [];
      const skipped = result.results?.filter((r: { status: string }) => r.status === 'skipped') || [];

      let message = `DDNS 갱신 완료!\n\n`;
      message += `현재 IP: ${result.currentIP || 'N/A'}\n`;
      message += `총 ${result.totalRecords || 0}개 대상 레코드\n`;
      message += `업데이트: ${updated.length}개\n`;
      if (skipped.length > 0) message += `건너뜀: ${skipped.length}개 (변경불필요)\n`;
      if (errors.length > 0) message += `오류: ${errors.length}개\n`;

      if (updated.length > 0) {
        message += `\n업데이트된 레코드:\n`;
        updated.forEach((record: { name: string; zoneName?: string; content: string; message?: string }) => {
          const zoneInfo = record.zoneName ? ` (${record.zoneName})` : '';
          message += `• ${record.name}${zoneInfo}: ${record.content}\n`;
          if (record.message && record.message.includes('변환')) message += `  ${record.message}\n`;
        });
      }

      if (errors.length > 0) {
        message += `\n에러 발생 레코드:\n`;
        errors.forEach((error: { name: string; zoneName?: string; message?: string; error?: string }) => {
          const zoneInfo = error.zoneName ? ` (${error.zoneName})` : '';
          message += `• ${error.name}${zoneInfo}: ${error.message || error.error}\n`;
        });
      }

      showSuccessToast(message);

      if (selectedZone && selectedApiKey) {
        await selectZoneAndLoadRecords(selectedZone);
      }
    } catch (error) {
      handleApiError(error, 'DDNS update error');
    } finally {
      setDdnsLoading(false);
    }
  }, [selectedApiKey, selectedZone, selectZoneAndLoadRecords]);

  // DDNS 토글 상태 변경
  const handleAutoUpdateToggle = useCallback(async (recordId: string, currentValue: boolean) => {
    try {
      setRecords(prev => prev.map(r =>
        r.id === recordId ? { ...r, autoUpdate: !currentValue } : r
      ));

      const result = await toggleDDNSAutoUpdate(recordId, !currentValue, selectedZone, selectedApiKey);
      showSuccessToast(result.message);
    } catch (error) {
      setRecords(prev => prev.map(r =>
        r.id === recordId ? { ...r, autoUpdate: currentValue } : r
      ));
      handleApiError(error, 'DDNS toggle error');
    }
  }, [selectedZone, selectedApiKey]);

  // 이벤트 핸들러
  const handleApiKeyChange = useCallback(async (apiKeyId: string) => {
    try {
      await selectApiKeyAndLoadZones(apiKeyId);
    } catch (error) {
      handleApiError(error, t('common.error'));
    }
  }, [selectApiKeyAndLoadZones, t]);

  const handleZoneChange = useCallback(async (zoneId: string) => {
    try {
      await selectZoneAndLoadRecords(zoneId);
    } catch (error) {
      handleApiError(error, t('common.error'));
    }
  }, [selectZoneAndLoadRecords, t]);

  const handleReload = useCallback(async () => {
    if (selectedApiKey) {
      try {
        await selectApiKeyAndLoadZones(selectedApiKey);
      } catch (error) {
        handleApiError(error, t('common.error'));
      }
    }
  }, [selectedApiKey, selectApiKeyAndLoadZones, t]);

  const resetState = useCallback(() => {
    setApiKeys([]);
    setSelectedApiKeyState('');
    setZones([]);
    setSelectedZoneState('');
    setRecords([]);
    setCurrentIP(null);
    setIpError('');
  }, []);

  return {
    // State
    currentIP,
    ipLoading,
    ipError,
    ddnsLoading,
    apiKeys,
    selectedApiKey,
    zones,
    selectedZone,
    records,
    zonesLoading,
    recordsLoading,
    // Actions
    fetchCurrentIP,
    loadApiKeys,
    handleDDNSUpdate,
    handleAutoUpdateToggle,
    handleApiKeyChange,
    handleZoneChange,
    handleReload,
    selectZoneAndLoadRecords,
    resetState,
  };
}
