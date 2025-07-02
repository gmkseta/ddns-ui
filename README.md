# Cloudflare DDNS Web UI

Cloudflare DNS API를 활용한 **DDNS 관리 웹 UI**입니다.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)

## ✨ 주요 기능

- 🔐 **보안 인증**: JWT 기반 관리자 로그인
- 🔑 **API 키 관리**: Cloudflare API 토큰 등록 및 관리
- 🌐 **Zone 관리**: 도메인 Zone 선택 및 조회
- 📝 **DNS 레코드**: A/CNAME 레코드 추가/편집/삭제
- 🔄 **자동 갱신**: 설정된 주기로 공인 IP 변경 시 자동 업데이트
- 📊 **모니터링**: 갱신 로그 및 현재 상태 확인
- 📤 **백업/복원**: 설정을 JSON으로 내보내기/가져오기
- 🐳 **Docker 지원**: 원클릭 Docker 배포

## 🚀 빠른 시작

### Docker Compose 사용 (권장)

1. **환경변수 설정**
   ```bash
   # .env 파일 생성
   cat > .env << EOF
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password
   JWT_SECRET=your-random-jwt-secret-key
   UPDATE_INTERVAL=5
   EOF
   ```

2. **컨테이너 실행**
   ```bash
   docker-compose up -d
   ```

3. **웹 UI 접속**
   - http://localhost:3000 접속
   - 설정한 관리자 계정으로 로그인

### 로컬 개발 환경

1. **의존성 설치**
   ```bash
   yarn install
   ```

2. **환경변수 설정**
   ```bash
   # .env.local 파일 생성
   cat > .env.local << EOF
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password
   JWT_SECRET=your-random-jwt-secret-key
   DATABASE_PATH=./data/db.sqlite3
   UPDATE_INTERVAL=5
   NODE_ENV=development
   EOF
   ```

3. **개발 서버 실행**
   ```bash
   yarn dev
   ```

## 📋 사용 가이드

### 1. API 키 등록

1. [Cloudflare 대시보드](https://dash.cloudflare.com/profile/api-tokens)에서 API Token 생성
2. 필요한 권한: `Zone:Read`, `DNS:Edit`
3. 웹 UI에서 "API 키 설정" → API Token 입력

### 2. Zone 선택

1. "Zone 관리" → API 키 선택
2. 도메인 Zone 목록 조회 및 선택

### 3. DNS 레코드 관리

1. "DNS 레코드" → Zone 선택
2. A/CNAME 레코드 추가
3. "자동 갱신" 체크박스로 DDNS 활성화

### 4. 자동 갱신 설정

- 설정된 주기(기본 5분)마다 공인 IP 확인
- IP 변경 시 자동으로 DNS 레코드 업데이트
- 갱신 로그 및 상태 모니터링

## 🔧 환경변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `ADMIN_USERNAME` | 관리자 사용자명 | `admin` |
| `ADMIN_PASSWORD` | 관리자 비밀번호 | `changeme` |
| `JWT_SECRET` | JWT 토큰 시크릿 | (필수 설정) |
| `DATABASE_PATH` | SQLite DB 경로 | `./data/db.sqlite3` |
| `UPDATE_INTERVAL` | 갱신 주기(분) | `5` |
| `NODE_ENV` | 실행 환경 | `development` |

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: SQLite3
- **Authentication**: JWT (jose)
- **API Client**: Axios
- **State Management**: TanStack Query
- **Icons**: Heroicons
- **Deployment**: Docker, Docker Compose

## 📁 프로젝트 구조

```
ddns-ui/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API 라우트
│   │   │   ├── auth/       # 인증 관련
│   │   │   ├── config/     # 설정 관리
│   │   │   ├── zones/      # Zone 관리
│   │   │   ├── records/    # DNS 레코드
│   │   │   └── ddns/       # DDNS 갱신
│   │   └── page.tsx        # 메인 페이지
│   ├── components/         # React 컴포넌트
│   ├── lib/               # 유틸리티 라이브러리
│   │   ├── database.ts    # SQLite DB 관리
│   │   ├── cloudflare.ts  # Cloudflare API
│   │   ├── auth.ts        # JWT 인증
│   │   └── scheduler.ts   # DDNS 스케줄러
│   └── providers/         # React Providers
├── Dockerfile            # Docker 설정
├── docker-compose.yml    # Docker Compose
└── data/                # SQLite DB 저장소
```

## 🐳 Docker 배포

### 직접 빌드

```bash
# 이미지 빌드
docker build -t cloudflare-ddns-ui .

# 컨테이너 실행
docker run -d \
  --name cloudflare-ddns-ui \
  -p 3000:3000 \
  -v ddns-data:/app/data \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=your-password \
  -e JWT_SECRET=your-secret \
  cloudflare-ddns-ui
```

## 📝 API 문서

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### IP 조회
- `GET /api/ip` - 현재 공인 IP 조회

### 설정 관리
- `GET/POST/DELETE /api/config/apikey` - API 키 관리

### Zone 관리
- `GET /api/zones` - Zone 목록 조회

### DNS 레코드
- `GET/POST/PUT/DELETE /api/records` - DNS 레코드 CRUD

### DDNS 갱신
- `GET/POST /api/ddns/update` - 자동 갱신 상태/실행

## 🔒 보안 고려사항

- JWT 토큰 기반 인증
- API 키는 암호화되지 않으므로 보안에 주의
- HTTPS 사용 권장
- 정기적인 비밀번호 변경 권장
