# DDNS-UI 프로젝트 컨텍스트

## 프로젝트 개요
- **프로젝트명**: DDNS-UI
- **목적**: Cloudflare DNS API를 활용한 Dynamic DNS(DDNS) 관리 웹 UI
- **기술 스택**: Next.js 15, TypeScript, Tailwind CSS, SQLite, Docker
- **GitHub**: https://github.com/gmkseta/ddns-ui
- **Docker Hub**: gmkseta/ddns-ui

## 주요 기능
1. **DNS 레코드 관리**
   - Cloudflare API를 통한 DNS 레코드 CRUD
   - A/CNAME 레코드 자동 업데이트 (DDNS)
   - 수동/자동 업데이트 구분 및 로깅

2. **스케줄러**
   - 5분 간격 자동 IP 업데이트 (환경변수로 설정 가능)
   - 개발/프로덕션 환경 모두에서 자동 시작
   - 수동 실행, 시작/중지 제어 가능

3. **다국어 지원**
   - 한국어(ko), 영어(en), 일본어(ja)
   - 브라우저 언어 자동 감지
   - 로그인 페이지에서도 언어 변경 가능

4. **인증 시스템**
   - JWT 기반 인증
   - 환경변수로 관리자 계정 설정

## 프로젝트 구조
```
ddns-ui/
├── src/
│   ├── app/
│   │   ├── [locale]/          # 다국어 라우팅
│   │   │   ├── page.tsx       # 메인 페이지
│   │   │   └── layout.tsx     # 레이아웃
│   │   └── api/               # API 라우트
│   ├── components/            # React 컴포넌트
│   ├── lib/                   # 유틸리티 함수
│   │   ├── database.ts        # SQLite 설정
│   │   ├── cloudflare.ts      # Cloudflare API
│   │   └── scheduler.ts       # DDNS 스케줄러
│   ├── messages/              # 다국어 번역 파일
│   └── utils/                 # 헬퍼 함수
├── middleware.ts              # Next.js 미들웨어 (다국어 처리)
├── docker-compose.yml         # Docker Compose 설정
└── Dockerfile                # Docker 이미지 빌드
```

## 데이터베이스 스키마
```sql
-- API 키 관리
CREATE TABLE api_keys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  token TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Zone 정보
CREATE TABLE zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_key_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (api_key_id) REFERENCES api_keys (id)
);

-- DNS 레코드
CREATE TABLE dns_records (
  id TEXT PRIMARY KEY,
  zone_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  ttl INTEGER DEFAULT 1,
  proxied BOOLEAN DEFAULT 0,
  auto_update BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (zone_id) REFERENCES zones (id)
);

-- 업데이트 로그
CREATE TABLE update_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_id TEXT NOT NULL,
  old_ip TEXT,
  new_ip TEXT,
  status TEXT NOT NULL,
  message TEXT,
  trigger_type TEXT DEFAULT 'auto',  -- 'auto' 또는 'manual'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (record_id) REFERENCES dns_records (id)
);
```

## 환경변수
```env
# 관리자 계정
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme

# JWT 시크릿
JWT_SECRET=your-random-jwt-secret

# 데이터베이스 경로
DATABASE_PATH=/app/data/db.sqlite3

# DDNS 업데이트 주기 (분)
UPDATE_INTERVAL=5

# Docker Compose용
HOST_PORT=3000  # 호스트 포트 변경 가능
```

## 주요 개선사항 (v0.0.2)
1. 브라우저 언어 감지 및 자동 리다이렉트
2. 로그인 페이지 언어 선택 기능
3. 스케줄러 개발 환경 자동 시작
4. DNS 레코드 페이지 새로고침 버튼
5. 스케줄러 로그 UI 개선 (IP 변경 정보 위아래 표시)
6. Docker Compose 포트 설정 개선
7. 프로덕션 빌드 에러 수정

## 배포 방법
### Docker Compose
```bash
# 기본 실행
docker-compose up -d

# 포트 변경
HOST_PORT=8080 docker-compose up -d

# 환경변수 파일 사용
cp .env.example .env
# .env 파일 편집 후
docker-compose up -d
```

### 직접 실행
```bash
# 개발 서버
yarn dev

# 프로덕션 빌드
yarn build
yarn start
```

## 주의사항
1. 프로덕션 환경에서는 반드시 환경변수 변경 필요
2. SQLite 데이터는 Docker 볼륨에 저장됨
3. CNAME → A 레코드 변환 시 Cloudflare Proxy 자동 비활성화
4. 파일 크기는 500줄 기준으로 컴포넌트 분리

## GitHub Actions
- main 브랜치 푸시 또는 태그 생성 시 자동 빌드
- Docker Hub에 multi-platform 이미지 푸시 (amd64, arm64)
- Trivy 보안 스캔 자동 실행