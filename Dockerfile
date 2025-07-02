# ===========================================
# 빌드 스테이지
# ===========================================
FROM node:18-alpine AS builder

WORKDIR /app

# 패키지 파일 복사
COPY package.json yarn.lock ./

# 빌드 도구 설치
RUN apk add --no-cache python3 make g++ sqlite-dev

# 의존성 설치 (개발 의존성 포함)
RUN yarn install --frozen-lockfile

# SQLite3 네이티브 모듈 재빌드
RUN npm rebuild sqlite3

# 소스 코드 복사
COPY . .

# 빌드 (DB 초기화 없이)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PHASE=phase-production-build
RUN yarn build

# ===========================================
# 런타임 스테이지  
# ===========================================
FROM node:18-alpine AS runner

WORKDIR /app

# 시스템 의존성 설치
RUN apk add --no-cache \
    sqlite \
    curl \
    python3 \
    make \
    g++ \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# 프로덕션 의존성만 설치
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# SQLite3 네이티브 모듈 재빌드 (Alpine Linux용)
RUN npm rebuild sqlite3

# 빌드 결과물 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 권한 설정
RUN chown -R nextjs:nodejs /app

# 데이터 디렉토리 생성 및 권한 설정
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

# 애플리케이션 시작
CMD ["node", "server.js"] 