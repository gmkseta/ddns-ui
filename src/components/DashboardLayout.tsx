'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  user?: {
    username: string;
  } | null;
  onLogout?: () => void;
  activePage?: string;
  onPageChange?: (pageId: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export default function DashboardLayout({ 
  children, 
  user, 
  onLogout, 
  activePage = 'dashboard', 
  onPageChange 
}: DashboardLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const [activeMenu, setActiveMenu] = useState(activePage);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentIP, setCurrentIP] = useState<string | null>(null);
  const [ipLoading, setIpLoading] = useState(false);

  useEffect(() => {
    setActiveMenu(activePage);
  }, [activePage]);

  const handleCheckIP = async () => {
    setIpLoading(true);
    try {
      const response = await fetch('/api/ip');
      if (response.ok) {
        const data = await response.json();
        setCurrentIP(data.ip);
      } else {
        console.error('IP 조회 실패');
        setCurrentIP('조회 실패');
      }
    } catch (error) {
      console.error('IP 조회 오류:', error);
      setCurrentIP('조회 실패');
    } finally {
      setIpLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export');
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ddns-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('설정 내보내기에 실패했습니다.');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const config = JSON.parse(text);
        
        const response = await fetch('/api/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(config),
        });

        if (response.ok) {
          alert('설정을 성공적으로 가져왔습니다.');
          window.location.reload();
        } else {
          const data = await response.json();
          alert(`설정 가져오기에 실패했습니다: ${data.error}`);
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('설정 파일을 읽는데 실패했습니다.');
      }
    };
    input.click();
  };

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: '대시보드',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z" />
        </svg>
      ),
    },
    {
      id: 'dns-records',
      label: 'DNS 레코드 관리',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'auto-update',
      label: '자동 갱신 설정',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      id: 'ip-check',
      label: 'IP 확인',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
        </svg>
      ),
      onClick: handleCheckIP,
    },
    {
      id: 'backup-export',
      label: '설정 내보내기',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      onClick: handleExport,
    },
    {
      id: 'backup-import',
      label: '설정 가져오기',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
      onClick: handleImport,
    },
    {
      id: 'theme-toggle',
      label: theme === 'dark' ? '라이트 모드' : '다크 모드',
      icon: theme === 'dark' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      onClick: toggleTheme,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 사이드바 */}
      <div className={`bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        {/* 로고 */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          {!sidebarCollapsed && (
            <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">DDNS Manager</h1>
          )}
        </div>

        {/* 메뉴 */}
        <nav className="mt-8 px-4 flex-1">
          <ul className="space-y-2">
            {/* 주 메뉴 */}
            {menuItems.slice(0, 3).map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveMenu(item.id);
                    onPageChange?.(item.id);
                    item.onClick?.();
                  }}
                  className={`w-full flex items-center px-3 py-3 rounded-xl transition-colors text-left ${
                    activeMenu === item.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className={activeMenu === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}>
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && (
                    <span className="ml-3 font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            ))}
            
            {/* 구분선 */}
            {!sidebarCollapsed && (
              <li className="py-2">
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
              </li>
            )}
            
            {/* 도구 메뉴 */}
            {menuItems.slice(3).map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    item.onClick?.();
                  }}
                  disabled={item.id === 'ip-check' && ipLoading}
                  className={`w-full flex items-center px-3 py-3 rounded-xl transition-colors text-left ${
                    item.id === 'ip-check' && ipLoading
                      ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-gray-400 dark:text-gray-500">
                    {item.id === 'ip-check' && ipLoading ? (
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      item.icon
                    )}
                  </span>
                  {!sidebarCollapsed && (
                    <span className="ml-3 font-medium">
                      {item.id === 'ip-check' && ipLoading ? 'IP 조회 중...' : item.label}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* 하단 영역 */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* 현재 IP 표시 */}
          {currentIP && !sidebarCollapsed && (
            <div className="px-4 py-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                    <span className="ml-2 text-xs font-medium text-blue-600 dark:text-blue-400">현재 IP</span>
                  </div>
                  <button
                    onClick={() => setCurrentIP(null)}
                    className="text-blue-400 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-400"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="mt-1 text-sm font-mono text-blue-800 dark:text-blue-300 truncate">
                  {currentIP}
                </p>
              </div>
            </div>
          )}

          {/* 사용자 정보 */}
          <div className="p-4">
          {user && (
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center min-w-0 flex-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">관리자</p>
                  </div>
                </div>
              )}
              <button
                onClick={onLogout}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                title="로그아웃"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단바 */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="ml-4 text-lg font-semibold text-gray-900 dark:text-white">
              {menuItems.find(item => item.id === activeMenu)?.label || '대시보드'}
            </h2>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>


    </div>
  );
} 