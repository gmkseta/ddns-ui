import createMiddleware from 'next-intl/middleware';
import {routing} from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // 루트 경로를 포함하여 모든 경로에 매치 (API와 정적 파일 제외)
  matcher: [
    // 루트 경로 명시적으로 포함
    '/',
    // 다른 모든 경로 (API와 정적 파일 제외)
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}; 