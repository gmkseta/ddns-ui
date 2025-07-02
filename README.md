# Cloudflare DDNS Web UI

Cloudflare DNS API를 활용한 **DDNS 관리 웹 UI**입니다.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![Docker Hub](https://img.shields.io/docker/v/gmkseta/ddns-ui?label=docker%20hub)

## 🚀 왜 이 프로젝트가 필요한가?

### 💸 기존 DDNS 서비스와 비교

| 서비스 | 가격 | 도메인 | 갱신 주기 | 제한사항 |
|--------|------|--------|-----------|----------|
| **NoIP** | 무료/유료 | 제한된 도메인 | 30일마다 수동 갱신 | 기능 제한 |
| **DynDNS** | 유료 | 제한된 도메인 | 자동 | 월 구독료 |
| **Duck DNS** | 무료 | 서브도메인만 | 자동 | 커스텀 도메인 불가 |
| **AWS Route 53** | 유료 | 자유 | 자동 | 복잡한 설정, 비용 |
| **🌟 이 프로젝트** | **완전 무료** | **자신의 도메인** | **자동** | **제한 없음** |

### ✨ Cloudflare 기반 무료 DDNS의 장점
- 🆓 **완전 무료**: Cloudflare의 무료 DNS 서비스 활용
- 🌐 **자신의 도메인**: 원하는 도메인으로 DDNS 구축 가능
- ⚡ **빠른 속도**: Cloudflare의 글로벌 CDN 활용
- 🔒 **높은 신뢰성**: 99.9% 업타임 보장
- 🛡️ **추가 보안**: DDoS 보호, SSL 인증서 자동 발급
- 📊 **상세 통계**: 트래픽 분석 및 모니터링
- 🔧 **완전한 제어**: 모든 DNS 설정을 직접 관리

### 🤖 AI 페어 프로그래밍으로 개발
이 프로젝트는 **Cursor AI**와 함께하는 **바이브코딩(Vibe Coding)**으로 개발되었습니다.
- 💡 **AI 어시스턴트**: Claude Sonnet을 활용한 페어 프로그래밍
- ⚡ **빠른 개발**: 실시간 코드 생성 및 최적화
- 🔍 **코드 품질**: AI 기반 코드 리뷰 및 버그 예방
- 📚 **자동 문서화**: 포괄적인 문서 자동 생성

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

### 🐳 Docker Hub 이미지 사용 (가장 간편)

1. **Docker 컨테이너 바로 실행**
   ```bash
   docker run -d \
     --name ddns-ui \
     -p 3000:3000 \
     -v ddns-data:/app/data \
     -e ADMIN_USERNAME=admin \
     -e ADMIN_PASSWORD=your-secure-password \
     -e JWT_SECRET=your-random-jwt-secret-key \
     --restart unless-stopped \
     gmkseta/ddns-ui:latest
   ```

2. **Docker Compose로 실행**
   ```yaml
   version: '3.8'
   services:
     ddns-ui:
       image: gmkseta/ddns-ui:latest
       container_name: ddns-ui
       ports:
         - "3000:3000"
       environment:
         - ADMIN_USERNAME=admin
         - ADMIN_PASSWORD=your-secure-password
         - JWT_SECRET=your-random-jwt-secret-key
         - UPDATE_INTERVAL=5
       volumes:
         - ddns-data:/app/data
       restart: unless-stopped

   volumes:
     ddns-data:
   ```

3. **웹 UI 접속**
   - http://localhost:3000 접속
   - 설정한 관리자 계정으로 로그인

### Docker Compose 사용 (소스 빌드)

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

### Docker Hub에서 사용

```bash
# 최신 이미지 가져오기
docker pull gmkseta/ddns-ui:latest

# 컨테이너 실행
docker run -d \
  --name ddns-ui \
  -p 3000:3000 \
  -v ddns-data:/app/data \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=your-password \
  -e JWT_SECRET=your-secret \
  --restart unless-stopped \
  gmkseta/ddns-ui:latest
```

### 소스에서 직접 빌드

```bash
# 이미지 빌드
docker build -t ddns-ui .

# 컨테이너 실행
docker run -d \
  --name ddns-ui \
  -p 3000:3000 \
  -v ddns-data:/app/data \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=your-password \
  -e JWT_SECRET=your-secret \
  --restart unless-stopped \
  ddns-ui
```

### 개발자용: Docker Hub에 푸시

```bash
# 이미지 빌드 및 태그
docker build -t ddns-ui .
docker tag ddns-ui yourusername/ddns-ui:latest

# Docker Hub 로그인 및 푸시
docker login
docker push yourusername/ddns-ui:latest
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

## 🌟 왜 Cloudflare DDNS를 선택해야 할까?

### 💰 비용 절약
- **NoIP 유료 플랜**: $24.95/년
- **DynDNS**: $55/년
- **이 프로젝트**: **완전 무료** (Cloudflare 무료 플랜 사용)

### 🔥 추가 혜택
- **CDN**: 전 세계 빠른 속도
- **SSL**: 무료 SSL 인증서
- **DDoS 보호**: 무료 DDoS 방어
- **Analytics**: 상세한 트래픽 통계
- **API**: 강력한 DNS API 제공

## 🤖 AI와 함께한 개발 여정

이 프로젝트는 **Cursor AI**와 **Claude Sonnet 4**를 활용한 AI 페어 프로그래밍의 결과물입니다.

### 🚀 개발 과정
1. **아이디어 구상**: AI와 함께 요구사항 정의
2. **아키텍처 설계**: 최적의 기술 스택 선택
3. **코드 생성**: 실시간 AI 코딩 어시스턴스
4. **최적화**: AI 기반 코드 리뷰 및 개선
5. **문서화**: 포괄적인 문서 자동 생성
6. **배포**: Docker 최적화 및 배포 자동화

### 💡 AI 개발의 장점
- ⚡ **빠른 프로토타이핑**: 아이디어를 즉시 실현
- 🔍 **코드 품질**: AI가 베스트 프랙티스 적용
- 📚 **학습 효과**: 개발하며 새로운 기술 습득
- 🐛 **버그 예방**: 실시간 코드 분석 및 수정

## 📚 관련 링크

### 🛠️ 개발 도구
- [Cursor AI](https://cursor.sh/) - AI 기반 코드 에디터
- [Claude Sonnet](https://www.anthropic.com/claude) - AI 어시스턴트

### 🌐 서비스
- [Cloudflare](https://www.cloudflare.com/) - DNS 및 CDN 서비스
- [Docker Hub](https://hub.docker.com/r/gmkseta/ddns-ui) - 컨테이너 이미지

### 📖 기술 문서
- [Cloudflare API](https://developers.cloudflare.com/api/) - DNS API 문서
- [Next.js](https://nextjs.org/) - React 프레임워크
- [Docker](https://docs.docker.com/) - 컨테이너화 가이드

## 🙏 크레딧

- **개발**: AI 페어 프로그래밍 (Cursor + Claude Sonnet 4)
- **디자인**: 토스 스타일 UI 디자인 시스템 영감
- **인프라**: Cloudflare 무료 서비스 활용
- **배포**: Docker Hub 커뮤니티 지원

---

💡 **팁**: 이 프로젝트를 통해 월 $5~10의 DDNS 서비스 비용을 절약하고, 더 나은 성능과 기능을 누려보세요!
