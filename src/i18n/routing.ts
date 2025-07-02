import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  // 지원하는 로케일 목록
  locales: ['ko', 'en', 'ja'],
  
  // 기본 로케일
  defaultLocale: 'ko',
  
  // 로케일 감지 활성화
  localeDetection: true,
  
  // 로케일 prefix를 always로 설정하여 URL에 항상 로케일 포함
  localePrefix: 'always'
});

// 타입 안전한 네비게이션 유틸리티
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing); 