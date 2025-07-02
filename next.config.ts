import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // 환경변수 설정
  env: {
    DATABASE_PATH: process.env.DATABASE_PATH || './data/db.sqlite3',
    UPDATE_INTERVAL: process.env.UPDATE_INTERVAL || '5',
  },

  // 서버 외부 패키지 설정
  serverExternalPackages: ['sqlite3'],
  
  // 빌드 시 ESLint 및 TypeScript 검사 건너뛰기
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withNextIntl(nextConfig);
