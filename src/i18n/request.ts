import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ locale }) => {
  // 지원하지 않는 로케일인지 확인 (routing에서 정의된 locales 사용)
  if (!routing.locales.includes(locale as 'ko' | 'en' | 'ja')) {
    // notFound를 호출하지 않고 기본 로케일 사용
    locale = routing.defaultLocale;
  }

  return {
    locale: locale as string,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});

// 기존 코드와의 호환성을 위해 export
export const locales = routing.locales;
export type Locale = typeof locales[number]; 