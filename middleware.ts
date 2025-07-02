import createMiddleware from 'next-intl/middleware';
import { locales } from './src/i18n/request';

export default createMiddleware({
  // 지원하는 로케일 목록
  locales,
  
  // 기본 로케일 (한국어)
  defaultLocale: 'ko',
  
  // 로케일 감지 전략
  localeDetection: true,
  
  // API 경로는 국제화에서 제외
  pathnames: {
    '/': '/',
    '/api': '/api'
  }
});

export const config = {
  // API 경로, Next.js 내부 파일, 정적 파일 제외
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}; 