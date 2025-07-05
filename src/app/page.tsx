import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  // 브라우저의 Accept-Language 헤더 확인
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  
  // 브라우저 언어 감지
  let detectedLocale = 'en'; // 기본값
  
  if (acceptLanguage.includes('ko')) {
    detectedLocale = 'ko';
  } else if (acceptLanguage.includes('ja')) {
    detectedLocale = 'ja';
  }
  
  redirect(`/${detectedLocale}`);
}