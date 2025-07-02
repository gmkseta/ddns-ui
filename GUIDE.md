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

## 🚀 주요 기능

### 1. 인증 시스템
- JWT 기반 쿠키 인증
- Docker 환경변수로 어드민 계정 설정 (`ADMIN_USERNAME`, `ADMIN_PASSWORD`)

### 2. 통합 대시보드
- **현재 IP 위젯**: 버튼 클릭으로 카드 내부에 IP 표시
- **API 키 상태**: 등록된 키 개수 및 관리
- **자동 갱신 상태**: 활성 DDNS 레코드 수 표시
- **Zone 정보**: 선택된 Zone과 레코드 개수

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

## 🛠 기술 스택

- **Frontend**: Next.js 14 (App Router), TailwindCSS, TypeScript
- **Backend**: Next.js API Routes, SQLite
- **State Management**: TanStack Query
- **Authentication**: JWT (jose)
- **API**: Cloudflare DNS API v4
- **Deployment**: Docker + Docker Compose

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
2. 웹 UI 접속 후 로그인
3. Cloudflare API 키 등록
4. Zone 자동 선택 (또는 수동 선택)

### 2. DDNS 레코드 설정
1. 기존 CNAME 레코드의 DDNS 토글 활성화
2. 자동으로 A 레코드로 변환됨
3. 5분마다 자동 IP 갱신 시작

### 3. 수동 관리
1. "DDNS 즉시 갱신" 버튼으로 즉시 갱신
2. 정렬 기능으로 레코드 정리
3. JSON Export로 설정 백업

## 🔍 트러블슈팅

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

- 🌍 **다국어 지원**: 영어/한국어 UI
- 📱 **모바일 최적화**: PWA 지원
- 🔔 **알림 시스템**: 갱신 실패 시 웹훅 또는 이메일 알림
- 📊 **대시보드 확장**: 갱신 통계 및 차트
- 🔐 **다중 사용자**: 사용자별 API 키 관리

---

💡 **Tip**: DDNS 기능 사용 시 CNAME 레코드는 자동으로 A 레코드로 변환되며, Proxied 설정은 비활성화됩니다. 이는 Cloudflare API의 제약사항입니다.
