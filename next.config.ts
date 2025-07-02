import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 배포를 위한 standalone 빌드
  output: 'standalone',
  
  // 환경변수 설정
  env: {
    DATABASE_PATH: process.env.DATABASE_PATH || './data/db.sqlite3',
    UPDATE_INTERVAL: process.env.UPDATE_INTERVAL || '5',
  },

  // 서버 외부 패키지 설정
  serverExternalPackages: ['sqlite3'],
};

export default nextConfig;
