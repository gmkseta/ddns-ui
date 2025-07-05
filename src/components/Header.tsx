'use client';

import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import { useTheme } from '@/providers/ThemeProvider';

interface HeaderProps {
  user: {
    username: string;
  };
  onLogout: () => void;
  onExport?: () => void;
  onImport?: () => void;
}

export default function Header({ user, onLogout, onExport, onImport }: HeaderProps) {
  const t = useTranslations();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('navbar.title')}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Export/Import 버튼들 */}
            {(onExport || onImport) && (
              <>
                <div className="flex items-center space-x-1 md:space-x-2">
                  {onExport && (
                    <button
                      onClick={onExport}
                      className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title={t('common.export')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="hidden md:inline">{t('common.export')}</span>
                    </button>
                  )}
                  
                  {onImport && (
                    <button
                      onClick={onImport}
                      className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title={t('common.import')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      <span className="hidden md:inline">{t('common.import')}</span>
                    </button>
                  )}
                </div>
                
                {/* 구분선 - 데스크톱에서만 표시 */}
                <div className="hidden md:block h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
              </>
            )}
            
            {/* 다크모드 토글 */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title={theme === 'light' ? t('theme.switchToDark') : t('theme.switchToLight')}
            >
              {theme === 'light' ? (
                // 달 아이콘 (다크모드로 전환)
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                // 태양 아이콘 (라이트모드로 전환)
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
            
            {/* 언어 스위처 */}
            <LanguageSwitcher />
            
            {/* 모바일에서는 사용자명 숨김, 로그아웃만 표시 */}
            <span className="hidden lg:inline text-sm text-gray-600 dark:text-gray-300">
              {t('dashboard.welcome', { name: user.username })}
            </span>
            <button
              onClick={onLogout}
              className="px-2 md:px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span className="hidden md:inline">{t('auth.logout')}</span>
              <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 