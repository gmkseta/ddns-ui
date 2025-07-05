import { redirect } from 'next/navigation';

// 루트 경로 접근 시 기본 로케일로 리다이렉트
export default function RootPage() {
  redirect('/en');
}