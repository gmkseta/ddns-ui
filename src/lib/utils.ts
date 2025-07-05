/**
 * 📄 Description:
 *   - 애플리케이션 전반에서 사용하는 유틸리티 함수들을 제공합니다.
 *
 * 🧱 Abstraction Level:
 *   - Utility
 *
 * 🔄 Used In:
 *   - API routes, Components, Middleware
 */

/**
 * 동적으로 사이트 URL을 생성합니다.
 * 환경변수가 설정되어 있으면 그것을 사용하고, 없으면 요청 헤더에서 추출합니다.
 */
export function getSiteUrl(request?: Request): string {
  // 환경변수가 설정되어 있으면 우선 사용
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // 요청 헤더에서 호스트 추출
  if (request) {
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 
                    (process.env.USE_HTTPS === 'true' ? 'https' : 'http');
    
    if (host) {
      return `${protocol}://${host}`;
    }
  }

  // 기본값 (개발 환경)
  return 'http://localhost:3000';
}

/**
 * 클라이언트 측에서 사이트 URL을 가져옵니다.
 */
export function getClientSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // 브라우저 환경에서는 현재 origin 사용
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'http://localhost:3000';
}

/**
 * 절대 URL을 생성합니다.
 */
export function getAbsoluteUrl(path: string, request?: Request): string {
  const siteUrl = getSiteUrl(request);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl}${cleanPath}`;
}