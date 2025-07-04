'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('ko');
  const locale = useLocale();
  const router = useRouter();
  // const pathname = usePathname(); // 사용되지 않으므로 주석처리

  useEffect(() => {
    setMounted(true);
    
    // URL에서 직접 로케일 추출
    const path = window.location.pathname;
    const localeFromPath = path.split('/')[1];
    if (languages.some(lang => lang.code === localeFromPath)) {
      setCurrentLocale(localeFromPath);
    } else {
      setCurrentLocale(locale);
    }
  }, [locale]);

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  // 마운트되기 전까지는 기본값 사용 (hydration mismatch 방지)
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700">
        <span className="text-lg">🌐</span>
        <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
      </div>
    );
  }

  const switchLanguage = (newLocale: string) => {
    try {
      // 현재 경로에서 로케일을 제외한 경로 추출
      const currentPath = window.location.pathname;
      const segments = currentPath.split('/').filter(Boolean);
      
      // 첫 번째 세그먼트가 언어 코드인지 확인
      const isFirstSegmentLocale = languages.some(lang => lang.code === segments[0]);
      const pathWithoutLocale = isFirstSegmentLocale ? segments.slice(1).join('/') : segments.join('/');
      
      // next-intl router를 사용해서 언어 전환
      const targetPath = pathWithoutLocale ? `/${pathWithoutLocale}` : '/';
      router.push(targetPath, { locale: newLocale });
      setIsOpen(false);
    } catch (error) {
      console.error('Language switch error:', error);
      // 폴백: 직접 페이지 이동
      const currentPath = window.location.pathname;
      const segments = currentPath.split('/').filter(Boolean);
      const isFirstSegmentLocale = languages.some(lang => lang.code === segments[0]);
      const pathWithoutLocale = isFirstSegmentLocale ? segments.slice(1).join('/') : segments.join('/');
      const targetPath = pathWithoutLocale ? `/${newLocale}/${pathWithoutLocale}` : `/${newLocale}`;
      window.location.href = targetPath;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-gray-700 dark:text-gray-200 font-medium">{currentLanguage.name}</span>
        {/* 드롭다운 화살표 */}
        <svg 
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* 오버레이 */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* 드롭다운 메뉴 */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg z-20">
            <div className="py-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => switchLanguage(language.code)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    language.code === currentLocale 
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <span>{language.name}</span>
                  {language.code === currentLocale && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 