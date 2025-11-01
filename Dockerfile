# ===========================================
# 의존성 설치 스테이지 (캐시 최적화)
# ===========================================
FROM node:25-alpine AS deps

RUN apk add --no-cache libc6-compat python3 make g++ sqlite-dev

WORKDIR /app

# 패키지 파일만 먼저 복사 (의존성 캐시 최적화)
COPY package.json yarn.lock ./

# 의존성 설치 (네트워크 타임아웃 증가 및 재시도 설정)
# ARM64 빌드 시 병렬 처리 제한으로 메모리 사용량 최적화
RUN if [ "$(uname -m)" = "aarch64" ]; then \
      yarn install --frozen-lockfile --network-timeout 300000 --network-concurrency 1; \
    else \
      yarn install --frozen-lockfile --network-timeout 300000; \
    fi

# ===========================================
# 빌드 스테이지
# ===========================================
FROM node:25-alpine AS builder

WORKDIR /app

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules

# 패키지 파일 복사
COPY package.json yarn.lock ./

# 설정 파일 먼저 복사 (캐시 최적화)
COPY next.config.ts tsconfig.json ./
COPY postcss.config.mjs ./

# 정적 파일 복사
COPY public ./public

# 소스 코드 복사 (가장 자주 변경됨)
COPY middleware.ts ./
COPY src ./src

# 빌드
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# 빌드 시 스케줄러가 시작되지 않도록 설정
ENV SKIP_SCHEDULER=1
# PostCSS 캐싱 활성화
ENV POSTCSS_CACHE=1
# ARM64에서 빌드 시 메모리 제한 설정
RUN if [ "$(uname -m)" = "aarch64" ]; then \
      NODE_OPTIONS="--max-old-space-size=2048" NEXT_TELEMETRY_DISABLED=1 yarn build; \
    else \
      NEXT_TELEMETRY_DISABLED=1 yarn build; \
    fi

# ===========================================
# 런타임 스테이지
# ===========================================
FROM node:25-alpine AS runner

WORKDIR /app

# 시스템 사용자 생성 및 SQLite 설치
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs \
    && apk add --no-cache sqlite curl

# 패키지 파일 복사 및 프로덕션 의존성 설치
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# 빌드 결과물 및 소스 복사
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/middleware.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/postcss.config.mjs ./

# 데이터 디렉토리 생성
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# nextjs 사용자로 전환
USER nextjs

# 포트 노출
EXPOSE 3000

# 환경변수 설정
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV DATABASE_PATH=/app/data/db.sqlite3

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/ip || exit 1

# 일반 모드로 실행 (스케줄러 동작 보장)
CMD ["yarn", "start"] 