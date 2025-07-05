import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // 환경변수 설정
  env: {
    DATABASE_PATH: process.env.DATABASE_PATH || './data/db.sqlite3',
    UPDATE_INTERVAL: process.env.UPDATE_INTERVAL || '5',
  },
  
  // 공개 런타임 환경변수 설정
  publicRuntimeConfig: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
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
  
  // 빌드 최적화 설정
  experimental: {
    // 빌드 워커 수 제한 (ARM64에서 메모리 사용량 감소)
    cpus: 2,
  },
  
  // 이미지 최적화 비활성화 (사용하지 않으므로)
  images: {
    unoptimized: true,
  },
  
  // CSS 최적화 설정
  webpack: (config, { isServer }) => {
    // CSS 처리 최적화
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        // CSS 분할 비활성화로 빌드 속도 향상
        splitChunks: {
          cacheGroups: {
            styles: {
              test: /\.(css|scss)$/,
              enforce: true,
              priority: 20,
            },
          },
        },
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
