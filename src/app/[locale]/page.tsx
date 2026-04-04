'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import LoginForm from '@/components/LoginForm';
import Header from '@/components/Header';
import StatusCards from '@/components/StatusCards';
import ExportImportModal from '@/components/ExportImportModal';
import AddRecordModal from '@/components/AddRecordModal';
import EditRecordModal from '@/components/EditRecordModal';
import APIKeyManager from '@/components/APIKeyManager';
import DNSTabNavigation from '@/components/DNSTabNavigation';
import Footer from '@/components/Footer';
import { useDDNSManager } from '@/hooks/useDDNSManager';

import { checkAuth, login, logout, User, DNSRecord } from '@/utils/api';
import { sortRecords, updateSortState, SortField, SortDirection } from '@/utils/sort';
import { handleApiError } from '@/utils/toast';
import { formatErrorMessage } from '@/utils/format';

const DEFAULT_SORT: SortField = 'synced';
const DEFAULT_DIRECTION: SortDirection = 'desc';

export default function Home() {
  const t = useTranslations();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // 모달 상태
  const [exportImportModal, setExportImportModal] = useState<{ isOpen: boolean; mode: 'export' | 'import' }>({
    isOpen: false,
    mode: 'export',
  });
  const [addRecordModal, setAddRecordModal] = useState(false);
  const [editRecordModal, setEditRecordModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DNSRecord | null>(null);
  const [apiKeyManagerModal, setApiKeyManagerModal] = useState(false);

  // 정렬 상태
  const [sortBy, setSortBy] = useState<SortField>(DEFAULT_SORT);
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_DIRECTION);

  // DDNS 관리 커스텀 훅
  const ddns = useDDNSManager();

  // 인증 확인
  useEffect(() => {
    (async () => {
      try {
        const userData = await checkAuth();
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 로그인 후 데이터 로드
  const { loadApiKeys, fetchCurrentIP } = ddns;
  useEffect(() => {
    if (user) {
      loadApiKeys();
      fetchCurrentIP();
    }
  }, [user, loadApiKeys, fetchCurrentIP]);

  // 로그인 처리
  const handleLogin = async (username: string, password: string) => {
    setLoginLoading(true);
    setLoginError('');
    try {
      const userData = await login(username, password);
      setUser(userData);
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      setLoginError(errorMessage === t('auth.loginError') ? errorMessage : t('auth.loginErrorGeneric'));
    } finally {
      setLoginLoading(false);
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      ddns.resetState();
    } catch (error) {
      handleApiError(error, 'Logout error');
    }
  };

  // 정렬 핸들러
  const handleSort = (field: SortField) => {
    const newState = updateSortState(field, sortBy, sortDirection);
    setSortBy(newState.sortBy);
    setSortDirection(newState.sortDirection);
  };

  // IP 반영 상태 확인
  const getRecordSyncStatus = (record: DNSRecord): 'synced' | 'notSynced' | 'notTarget' | 'noData' => {
    if (!record.autoUpdate) return 'notTarget';
    if (record.type === 'A') {
      if (!ddns.currentIP) return 'noData';
      return record.content === ddns.currentIP ? 'synced' : 'notSynced';
    }
    return 'notTarget';
  };

  const sortedRecords = sortRecords(ddns.records, sortBy, sortDirection, ddns.currentIP);

  // 모달 핸들러
  const openEditModal = (record: DNSRecord) => {
    setSelectedRecord(record);
    setEditRecordModal(true);
  };

  const closeEditModal = () => {
    setEditRecordModal(false);
    setSelectedRecord(null);
  };

  const closeApiKeyManager = () => {
    setApiKeyManagerModal(false);
    ddns.loadApiKeys();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} loading={loginLoading} error={loginError} />;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header
          user={user}
          onLogout={handleLogout}
          onExport={() => setExportImportModal({ isOpen: true, mode: 'export' })}
          onImport={() => setExportImportModal({ isOpen: true, mode: 'import' })}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StatusCards
            currentIP={ddns.currentIP}
            ipLoading={ddns.ipLoading}
            ipError={ddns.ipError}
            apiKeysCount={ddns.apiKeys.length}
            autoUpdateCount={ddns.records.filter(r => r.autoUpdate).length}
            onFetchIP={ddns.fetchCurrentIP}
          />

          <DNSTabNavigation
            apiKeys={ddns.apiKeys}
            zones={ddns.zones}
            records={ddns.records}
            sortedRecords={sortedRecords}
            currentIP={ddns.currentIP}
            selectedApiKey={ddns.selectedApiKey}
            selectedZone={ddns.selectedZone}
            zonesLoading={ddns.zonesLoading}
            recordsLoading={ddns.recordsLoading}
            ddnsLoading={ddns.ddnsLoading}
            onApiKeyChange={ddns.handleApiKeyChange}
            onZoneChange={ddns.handleZoneChange}
            onReload={ddns.handleReload}
            onSort={handleSort}
            onAddRecord={() => setAddRecordModal(true)}
            onEditRecord={openEditModal}
            onAutoUpdateToggle={ddns.handleAutoUpdateToggle}
            onDDNSUpdate={ddns.handleDDNSUpdate}
            onAddApiKey={() => setApiKeyManagerModal(true)}
            getRecordSyncStatus={getRecordSyncStatus}
          />
        </div>

        <Footer />
      </div>

      <ExportImportModal
        isOpen={exportImportModal.isOpen}
        mode={exportImportModal.mode}
        onClose={() => setExportImportModal({ isOpen: false, mode: 'export' })}
      />

      <AddRecordModal
        isOpen={addRecordModal}
        onClose={() => setAddRecordModal(false)}
        selectedZone={ddns.selectedZone}
        selectedApiKey={ddns.selectedApiKey}
        onRecordAdded={async () => {
          if (ddns.selectedZone && ddns.selectedApiKey) {
            await ddns.selectZoneAndLoadRecords(ddns.selectedZone);
          }
        }}
      />

      <EditRecordModal
        isOpen={editRecordModal}
        onClose={closeEditModal}
        selectedZone={ddns.selectedZone}
        selectedApiKey={ddns.selectedApiKey}
        record={selectedRecord}
        onRecordUpdated={async () => {
          if (ddns.selectedZone && ddns.selectedApiKey) {
            await ddns.selectZoneAndLoadRecords(ddns.selectedZone);
          }
        }}
      />

      {apiKeyManagerModal && <APIKeyManager onClose={closeApiKeyManager} />}
    </>
  );
}
