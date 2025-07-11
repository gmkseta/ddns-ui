import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  // 지원하는 로케일 목록
  locales: ['ko', 'en', 'ja'],
  
  // 기본 로케일을 영어로 설정
  defaultLocale: 'en',
  
  // 로케일 감지 활성화 (브라우저 언어 설정 우선)
  localeDetection: true,
  
  // 로케일 prefix를 as-needed로 변경하여 기본 로케일(en)일 때는 prefix 없음
  localePrefix: 'as-needed'
});

// 타입 안전한 네비게이션 유틸리티
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing); 