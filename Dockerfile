# ===========================================
# 의존성 설치 스테이지 (캐시 최적화)
# ===========================================
FROM node:24-alpine AS deps

RUN apk add --no-cache libc6-compat python3 make g++ sqlite-dev

WORKDIR /app

# 패키지 파일만 먼저 복사 (의존성 캐시 최적화)
COPY package.json yarn.lock ./

# 의존성 설치 (네트워크 타임아웃 증가 및 재시도 설정)
RUN yarn install --frozen-lockfile --network-timeout 300000 --network-concurrency 1

# ===========================================
# 빌드 스테이지
# ===========================================
FROM node:24-alpine AS builder

WORKDIR /app

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules

# 패키지 파일 복사
COPY package.json yarn.lock ./

# 필요한 소스 파일만 복사 (캐시 최적화)
COPY next.config.ts tsconfig.json ./
COPY src ./src
COPY public ./public
COPY middleware.ts ./

# 빌드
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN yarn build

# ===========================================
# 런타임 스테이지
# ===========================================
FROM node:24-alpine AS runner

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