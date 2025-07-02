# Node.js 공식 이미지 사용
FROM node:18-alpine AS base

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package*.json yarn.lock ./

# 의존성 설치
RUN yarn install --frozen-lockfile

# 소스 코드 복사
COPY . .

# Next.js 빌드
RUN yarn build

# 프로덕션 이미지
FROM node:18-alpine AS runner

# 작업 디렉토리 설정
WORKDIR /app

# 필요한 시스템 패키지 설치
RUN apk add --no-cache \
    sqlite \
    curl \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# 빌드된 파일 복사
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/package.json ./package.json

# 데이터 디렉토리 생성
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# 포트 설정
EXPOSE 3000

# 환경변수 설정
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/db.sqlite3

# nextjs 사용자로 전환
USER nextjs

# 애플리케이션 시작
CMD ["node", "server.js"] 