# Cloudflare DDNS Web UI

## 🌟 프로젝트 개요

**토스 스타일 디자인**을 적용한 **Cloudflare DNS API 기반 DDNS 관리 웹 UI**입니다.

원페이지 앱 구조로 DNS 레코드 관리와 DDNS 자동 갱신을 하나의 화면에서 모두 처리할 수 있습니다.

### ✨ 주요 특징

- 🎨 **토스 스타일 UI**: 부드러운 그라데이션과 깔끔한 카드 디자인
- 📱 **원페이지 앱**: 모든 기능이 하나의 화면에서 동작
- 🔄 **스마트 DDNS**: CNAME → A 레코드 자동 변환 지원
- 💾 **브라우저 기록**: 이전 선택사항 자동 복원
- ⚡️ **실시간 UI**: 즉시 갱신, 실시간 상태 표시
- 🌍 **다국어 지원**: 한국어, 영어, 일본어 UI (자동 감지 + 수동 선택)
- 🌙 **다크모드**: 라이트/다크 테마 토글 지원

## 🚀 주요 기능

### 1. 인증 시스템
- JWT 기반 쿠키 인증
- Docker 환경변수로 어드민 계정 설정 (`ADMIN_USERNAME`, `ADMIN_PASSWORD`)

### 2. 통합 대시보드
- **현재 IP 위젯**: 버튼 클릭으로 카드 내부에 IP 표시
- **API 키 상태**: 등록된 키 개수 및 관리
- **자동 갱신 상태**: 활성 DDNS 레코드 수 표시
- **Zone 정보**: 선택된 Zone과 레코드 개수
- **테마 토글**: 헤더에 라이트/다크모드 전환 버튼

### 3. DNS 레코드 관리
- **자동 선택**: API 키와 Zone 첫 번째 항목 자동 선택
- **브라우저 기록**: localStorage에 선택사항 저장/복원
- **정렬 기능**: 이름, 타입, 내용, TTL, DDNS 상태별 정렬
- **실시간 토글**: DDNS 자동 갱신 즉시 활성화/비활성화

### 4. 스마트 DDNS 시스템
- **CNAME → A 변환**: DDNS 활성화 시 자동으로 A 레코드로 변환
- **Proxy 자동 처리**: Proxied CNAME은 변환 시 Proxy 비활성화
- **5분 주기 갱신**: 백그라운드에서 IP 변경 자동 감지
- **즉시 갱신**: 수동 "DDNS 즉시 갱신" 버튼 제공

### 5. 모달 시스템
- **진짜 팝업**: 화면 중앙에 떠는 모달 (페이지 전환 없음)
- **배경 클릭 닫기**: 어두운 배경 클릭으로 모달 닫기
- **레코드 추가**: A, AAAA, CNAME, MX, TXT, SRV 레코드 지원
- **JSON Import/Export**: 설정 백업 및 복원

### 6. 다국어 지원 시스템
- **3개 언어**: 한국어(기본), 영어, 일본어
- **자동 감지**: 브라우저 언어 설정 기반 자동 선택
- **URL 라우팅**: `/ko`, `/en`, `/ja` 경로로 언어별 접근
- **실시간 전환**: 언어 선택기로 즉시 전환 (새로고침 없음)
- **상태 유지**: 선택한 언어를 브라우저에 기억
- **완전 번역**: 모든 UI 텍스트, 에러 메시지, 플레이스홀더

## 🛠 기술 스택

- **Frontend**: Next.js 15 (App Router), TailwindCSS, TypeScript
- **Backend**: Next.js API Routes, SQLite
- **State Management**: TanStack Query
- **Authentication**: JWT (jose)
- **Internationalization**: Next-intl (ko/en/ja)
- **API**: Cloudflare DNS API v4
- **Deployment**: Docker + Docker Compose

## 🏗️ 아키텍처 개선사항

### 최근 리팩토링 (2024.11)

#### 🔧 Next.js 15 + next-intl 호환성 개선
- **무한 리디렉션 문제 해결**: Next.js 15에서 `params`가 Promise로 변경됨에 따른 대응
- **middleware.ts 업데이트**: 새로운 next-intl routing API 적용
- **layout.tsx 최적화**: `params` 비동기 처리 및 locale 정확한 전달

#### 🧩 컴포넌트 모듈화
- **Header.tsx**: 상단 헤더, 언어 스위처, 다크모드 토글, 로그아웃 기능 분리
- **StatusCards.tsx**: IP 확인, API 키 상태, 자동갱신 상태 카드들 분리
- **기존 거대 컴포넌트 제거**: Navbar, DashboardLayout, IPChecker 등 불필요한 컴포넌트 정리

#### 🛠️ 유틸리티 함수 분리
- **`utils/constants.ts`**: API 엔드포인트, 스토리지 키 상수 관리
- **`utils/storage.ts`**: 로컬스토리지 관련 함수들
- **`utils/api.ts`**: API 호출 함수들 (checkAuth, login, logout, getCurrentIP 등)
- **`utils/sort.ts`**: DNS 레코드 정렬 관련 함수들
- **`utils/format.ts`**: 데이터 포맷팅 함수들 (TTL, 에러 메시지, 바이트 등)
- **`utils/toast.ts`**: 토스트 메시지 관련 함수들

#### 🌙 다크모드 시스템
- **ThemeProvider 개선**: hydration mismatch 방지를 위한 마운트 상태 관리
- **LanguageSwitcher 스타일**: 다크모드 대응 스타일 추가
- **태양/달 아이콘**: 직관적인 테마 토글 버튼

#### 🌍 다국어 시스템 안정화
- **hydration mismatch 해결**: useLocale 훅 대신 URL 기반 locale 추출
- **번역 파일 정리**: 하드코딩된 텍스트를 번역 키로 교체
- **메타데이터 다국어화**: title, description 번역 지원

### 최신 개선사항 (2024.12)

#### 🎨 토스트 시스템 완전 개선
- **이모지 제거**: 모든 토스트에서 이모지를 제거하고 SVG 아이콘으로 교체
- **옅은 배경색 적용**: 타입별 옅은 배경색 (emerald, red, amber, blue, gray)
- **다크모드 지원**: 라이트/다크 테마에 맞는 토스트 스타일
- **토스트 크기 증가**: 더 큰 크기와 글씨로 가독성 향상 (max-w-xl, text-base)
- **줄바꿈 개선**: 긴 메시지의 자연스러운 줄바꿈 처리

#### 🚨 에러 처리 시스템 강화
- **API 에러 자동 표시**: 모든 API 호출 실패 시 에러 토스트 자동 표시
- **handleApiError 함수**: 중앙화된 에러 처리 시스템
- **사용자 친화적 메시지**: 기술적 에러를 이해하기 쉬운 메시지로 변환

#### ✏️ 레코드 수정 기능 추가
- **EditRecordModal 컴포넌트**: 기존 레코드 직접 수정 기능
- **팝업 모달 형태**: 별도 페이지 이동 없이 즉시 수정
- **폼 자동 초기화**: 기존 레코드 데이터로 폼 필드 자동 설정
- **PUT API 지원**: 레코드 수정 전용 API 엔드포인트

#### 🚀 CI/CD 알림 시스템 개선
- **Slack 알림 도입**: GitHub Actions에서 Slack 웹훅으로 배포 알림
- **이슈 알림 제거**: 기존 GitHub 이슈 생성 방식을 Slack 메시지로 교체
- **시크릿 관리**: `SLACK_WEBHOOK_URL`을 GitHub Secrets으로 안전하게 관리
- **풍부한 메시지**: Slack 블록 UI로 상세한 배포 정보 제공

#### 🐳 Docker 최적화
- **Standalone 모드 제거**: Next.js standalone 출력 방식 비활성화
- **스케줄러 정상 작동**: `yarn start`로 실행하여 DDNS 스케줄러 정상 동작 보장
- **소스 코드 포함**: 런타임에 필요한 모든 소스 파일 복사
- **권한 최적화**: nextjs 사용자로 안전한 실행 환경 구성

## 📋 API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 사용자 정보

### 설정
- `GET /api/config/apikey` - API 키 목록
- `POST /api/config/apikey` - API 키 추가
- `DELETE /api/config/apikey` - API 키 삭제

### DNS 관리
- `GET /api/ip` - 현재 공인 IP 조회
- `GET /api/zones` - Zone 목록 조회
- `GET /api/records` - DNS 레코드 목록
- `POST /api/records` - 레코드 추가
- `PUT /api/records` - 레코드 수정
- `DELETE /api/records` - 레코드 삭제

### DDNS
- `POST /api/ddns/update` - 즉시 DDNS 갱신 실행

### 백업/복원
- `GET /api/export` - 설정 JSON 내보내기
- `POST /api/import` - 설정 JSON 가져오기

## 🔄 DDNS 갱신 로직

### 일반 A 레코드
```
IP 변경 감지 → A 레코드 content 업데이트
```

### CNAME 레코드 변환
```
DDNS 활성화 → CNAME 삭제 → A 레코드 생성 (현재 IP)
Proxied CNAME → Proxy 비활성화하여 A 레코드 생성
```

### 자동 갱신 주기
- **5분마다** 백그라운드에서 IP 변경 확인
- **변경된 경우에만** API 호출로 효율성 확보
- **에러 처리** 및 **상세 로그** 제공

## 🐳 Docker 배포

### docker-compose.yml
```yaml
version: '3.8'
services:
  ddns-ui:
    build: .
    ports:
      - "3000:3000"
    environment:
      - ADMIN_USERNAME=admin
      - ADMIN_PASSWORD=your-secure-password
      - JWT_SECRET=your-jwt-secret-key
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

### 실행 명령
```bash
# 빌드 및 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f ddns-ui
```

## 📊 데이터 구조

### SQLite 테이블
```sql
-- API 키 관리
CREATE TABLE api_keys (
  id TEXT PRIMARY KEY,
  token TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Zone 정보
CREATE TABLE zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_key_id TEXT,
  FOREIGN KEY (api_key_id) REFERENCES api_keys(id)
);

-- DNS 레코드
CREATE TABLE dns_records (
  id TEXT PRIMARY KEY,
  zone_id TEXT,
  name TEXT,
  type TEXT,
  content TEXT,
  ttl INTEGER,
  proxied BOOLEAN,
  auto_update BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (zone_id) REFERENCES zones(id)
);

-- 설정 및 로그
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE update_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_id TEXT,
  old_ip TEXT,
  new_ip TEXT,
  success BOOLEAN,
  error_message TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 사용 시나리오

### 1. 초기 설정
1. Docker 컨테이너 실행
2. 웹 UI 접속 (`http://localhost:3000`)
3. **언어 선택**: 상단 네비게이션에서 🇰🇷/🇺🇸/🇯🇵 클릭 (또는 브라우저 자동 감지)
4. 관리자 계정으로 로그인
5. Cloudflare API 키 등록
6. Zone 자동 선택 (또는 수동 선택)

### 2. DDNS 레코드 설정
1. 기존 CNAME 레코드의 DDNS 토글 활성화
2. 자동으로 A 레코드로 변환됨
3. 5분마다 자동 IP 갱신 시작

### 3. 수동 관리
1. "DDNS 즉시 갱신" 버튼으로 즉시 갱신
2. 정렬 기능으로 레코드 정리
3. JSON Export로 설정 백업

## 🔍 트러블슈팅

### Next.js 15 + next-intl 무한 리디렉션
- **증상**: `localhost:3000/ko`에서 계속 307 리디렉션 발생
- **원인**: Next.js 15에서 `params`가 Promise로 변경됨, 구버전 next-intl 호환성 문제
- **해결**: 
  - next-intl을 최신 버전으로 업데이트
  - `layout.tsx`에서 `const { locale } = await params;` 처리
  - `src/app/layout.tsx` 파일 제거 (중복 리디렉션 방지)
  - `src/i18n/routing.ts` 설정 파일 추가

### 다크모드 토글 미반영
- **증상**: 다크모드 버튼 클릭 시 테마가 바뀌지 않음
- **원인**: SSR hydration mismatch로 인한 테마 상태 불일치
- **해결**: ThemeProvider에 마운트 상태 관리 추가

### 언어 스위처 표시 오류
- **증상**: 언어가 바뀌어도 네비게이션 바에서 한국어로 고정 표시
- **원인**: useLocale() 훅의 hydration mismatch
- **해결**: URL에서 직접 로케일을 추출하여 현재 언어 표시

### CNAME Proxied 변환 실패
- **증상**: Proxied CNAME 레코드 변환 시 실패
- **원인**: Cloudflare는 Proxied 상태에서 A 레코드 변환 불가
- **해결**: 자동으로 Proxy 비활성화 후 변환

### IP 갱신 실패
- **증상**: "Found 0 auto-update records"
- **원인**: DDNS 토글이 비활성화된 상태
- **해결**: 레코드별 DDNS 토글 활성화 확인

### API 키 권한 부족
- **증상**: Zone 또는 레코드 조회 실패
- **원인**: API 키에 DNS 편집 권한 없음
- **해결**: Cloudflare에서 적절한 권한의 API 키 재생성

## 📈 향후 계획

- 📱 **모바일 최적화**: PWA 지원 및 반응형 개선
- 🔔 **알림 시스템**: 갱신 실패 시 웹훅 또는 이메일 알림
- 📊 **대시보드 확장**: 갱신 통계 및 차트
- 🔐 **다중 사용자**: 사용자별 API 키 관리
- 🌐 **다중 DNS 프로바이더**: AWS Route 53, DigitalOcean DNS 등 추가 지원
- ⚡ **성능 최적화**: API 캐싱 및 백그라운드 작업 개선

---

💡 **Tip**: DDNS 기능 사용 시 CNAME 레코드는 자동으로 A 레코드로 변환되며, Proxied 설정은 비활성화됩니다. 이는 Cloudflare API의 제약사항입니다.
