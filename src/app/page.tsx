import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function RootPage() {
  const headersList = await headers()
  const acceptLanguage = headersList.get('accept-language')
  
  // 로컬스토리지에서 저장된 언어 설정을 확인할 수 없으므로, 브라우저 설정을 우선 사용
  let locale = 'en' // 기본값
  
  if (acceptLanguage) {
    if (acceptLanguage.includes('ko')) {
      locale = 'ko'
    } else if (acceptLanguage.includes('ja')) {
      locale = 'ja'
    }
  }
  
  redirect(`/${locale}`)
}