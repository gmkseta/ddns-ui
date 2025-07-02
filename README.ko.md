# Cloudflare DDNS Web UI

Cloudflare DNS API를 활용한 **셀프호스트 다이나믹 DNS 관리 웹 인터페이스**

**🌍 Languages**: [English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![Docker Hub](https://img.shields.io/docker/v/gmkseta/ddns-ui?label=docker%20hub)

## 🚨 중요: 셀프호스트 솔루션

**이것은 셀프호스트 애플리케이션입니다**. 여러분의 서버나 컴퓨터에서 직접 실행해야 합니다. 클라우드 기반 DDNS 서비스와 달리, DNS 관리 시스템에 대한 완전한 제어권과 소유권을 유지할 수 있습니다.

### 📍 설치 가능한 곳:
- **홈 서버** (NAS, 라즈베리파이 등)
- **VPS/클라우드 서버** (DigitalOcean, AWS 등)
- **로컬 컴퓨터** (개발/테스트용)
- **Docker 사용 가능한 모든 기기**

## 🚀 기존 DDNS 서비스 대신 이걸 선택해야 하는 이유

### 💸 인기 서비스들과의 가격 비교

| 서비스 | 가격 | 도메인 | 갱신 | 제한사항 |
|--------|------|--------|------|----------|
| **NoIP** | 무료/유료 | 제한된 도메인 | 30일마다 수동 | 기능 제한 |
| **DynDNS** | $55/년 | 제한된 도메인 | 자동 | 월 구독료 |
| **Duck DNS** | 무료 | 서브도메인만 | 자동 | 커스텀 도메인 불가 |
| **AWS Route 53** | ~$15/년 | 자신의 도메인 | 자동 | 복잡한 설정, 비용 |
| **🌟 이 프로젝트** | **완전 무료** | **자신의 도메인** | **자동** | **제한 없음** |

### ✨ 클라우드 서비스 대신 셀프호스트를 선택해야 하는 이유

#### 🔒 **완전한 제어권**
- **데이터는 내 것**: DNS 레코드에 대한 제3자 접근 없음
- **벤더 락인 없음**: 인프라에 대한 완전한 제어
- **커스텀 기능**: 필요에 따라 수정 및 확장 가능

#### 💰 **상당한 비용 절약**
- **NoIP Premium**: $24.95/년 → **$0**
- **DynDNS**: $55/년 → **$0**
- **여러 도메인**: 도메인당 요금 vs. **무제한 무료**

#### 🌐 **뛰어난 성능**
- **Cloudflare 글로벌 CDN**: 99.9% 업타임 보장
- **무료 SSL 인증서**: 자동 HTTPS
- **DDoS 보호**: 엔터프라이즈급 보안
- **분석**: 상세한 트래픽 통계

#### 🔧 **전문가급 기능**
- **다중 DNS 프로바이더**: Cloudflare (곧 더 많이 추가 예정)
- **웹 인터페이스**: 명령줄 지식 불요
- **자동 업데이트**: 설정 후 방치 가능
- **백업/복원**: JSON 내보내기/가져오기 기능

## 🗺️ 로드맵: 다중 프로바이더 지원

### 🎯 현재 지원
- ✅ **Cloudflare DNS** (무료 플랜: 무제한 도메인)

### 🚧 곧 출시 예정
- 🔄 **AWS Route 53** (쿼리당 과금)
- 🔄 **DigitalOcean DNS** (드롭릿과 함께 무료)
- 🔄 **Namecheap DNS** (도메인 구매시 무료)
- 🔄 **Google Cloud DNS** (쿼리당 과금)
- 🔄 **Azure DNS** (쿼리당 과금)

### 💡 다중 프로바이더의 장점
- **선택과 유연성**: 선호하는 DNS 프로바이더 사용
- **중복성**: 필요시 프로바이더 변경 가능
- **비용 최적화**: 가장 비용 효율적인 옵션 선택
- **지역 선호도**: 특정 지역에서 더 잘 작동하는 프로바이더

## ✨ 주요 기능

- 🔐 **보안 인증**: JWT 기반 관리자 로그인
- 🔑 **API 키 관리**: 여러 DNS 프로바이더 토큰 등록 및 관리
- 🌐 **Zone 관리**: 도메인 Zone 선택 및 관리
- 📝 **DNS 레코드**: A/CNAME 레코드 추가/편집/삭제
- 🔄 **스마트 자동 갱신**: IP 변경 자동 감지 및 업데이트
- 📊 **모니터링**: 갱신 로그 및 실시간 상태
- 📤 **백업/복원**: 설정을 JSON으로 내보내기/가져오기
- 🌍 **다국어 지원**: 한국어, 영어, 일본어 인터페이스
- 🌙 **다크모드**: 라이트/다크 테마 토글 지원
- 🐳 **Docker 지원**: 원클릭 Docker 배포

## 🚀 빠른 시작

### 🐳 옵션 1: Docker Hub (가장 빠름)

```bash
# Docker로 빠른 실행
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

### 🐳 옵션 2: Docker Compose

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

### 🖥️ 옵션 3: 로컬 개발

```bash
# 클론 및 설치
git clone https://github.com/gmkseta/ddns-ui
cd ddns-ui
yarn install

# 환경 설정
cp .env.example .env.local
# .env.local 파일 편집

# 개발 서버 실행
yarn dev
```

## 📋 설정 가이드

### 1. Cloudflare API 토큰 발급

1. [Cloudflare API 토큰](https://dash.cloudflare.com/profile/api-tokens) 접속
2. "토큰 생성" 클릭
3. "사용자 정의 토큰" 템플릿 사용
4. 권한 설정: `Zone:Read`, `DNS:Edit`
5. 구역 리소스에 도메인 추가
6. 생성된 토큰 복사

### 2. 애플리케이션 설정

1. `http://localhost:3000`에서 웹 인터페이스 접속
2. **언어 선택**: 상단 네비게이션에서 🇰🇷/🇺🇸/🇯🇵 클릭 (브라우저 자동 감지도 지원)
3. 관리자 계정으로 로그인
4. "API 키 설정" → Cloudflare 토큰 추가
5. 도메인 구역 선택
6. DNS 레코드 추가/관리
7. DDNS 기능을 위해 "자동 갱신" 활성화

### 🌍 언어 지원

인터페이스는 브라우저 자동 감지와 함께 3개 언어를 지원합니다:
- **한국어**: 기본 언어 - `http://localhost:3000/ko`
- **English**: 국제 사용자 - `http://localhost:3000/en`  
- **日本語**: 일본 시장 - `http://localhost:3000/ja`

상단 네비게이션의 언어 선택기를 사용하여 언제든지 변경할 수 있습니다.

### 3. 자동 DDNS 누리기

- 시스템이 5분마다 공인 IP 확인
- IP 변경시 DNS 레코드 자동 업데이트
- 대시보드에서 업데이트 모니터링
- 필요에 따라 설정 내보내기/가져오기

## 🔧 환경변수

| 변수 | 설명 | 기본값 |
|----------|-------------|---------|
| `ADMIN_USERNAME` | 관리자 사용자명 | `admin` |
| `ADMIN_PASSWORD` | 관리자 비밀번호 | `changeme` |
| `JWT_SECRET` | JWT 토큰 시크릿 | (필수) |
| `DATABASE_PATH` | SQLite DB 경로 | `./data/db.sqlite3` |
| `UPDATE_INTERVAL` | 갱신 주기(분) | `5` |
| `NODE_ENV` | 실행 환경 | `development` |

## 🤖 AI 페어 프로그래밍으로 개발

이 프로젝트는 **Cursor AI**와 **Claude Sonnet 4**를 활용한 **AI 지원 프로그래밍**으로 개발되었습니다.

### 🚀 개발 과정
1. **아이디어 창출**: AI 지원 요구사항 수집
2. **아키텍처**: 최적의 기술 스택 선택
3. **코딩**: 실시간 AI 코딩 지원
4. **최적화**: AI 기반 코드 리뷰
5. **문서화**: 포괄적인 자동 생성 문서
6. **배포**: Docker 최적화 및 자동화

### 💡 AI 개발의 장점
- ⚡ **빠른 프로토타이핑**: 아이디어를 즉시 구현
- 🔍 **코드 품질**: AI가 자동으로 베스트 프랙티스 적용
- 📚 **학습**: 개발 중 지속적인 지식 전수
- 🐛 **버그 예방**: 실시간 코드 분석 및 수정

## 🛠️ 기술 스택

- **프론트엔드**: Next.js 15, React 19, TailwindCSS
- **백엔드**: Next.js API Routes, Node.js
- **데이터베이스**: SQLite3 (파일 기반, 외부 의존성 없음)
- **인증**: JWT (jose)
- **HTTP 클라이언트**: Axios
- **상태 관리**: TanStack Query
- **국제화**: Next-intl (한국어/영어/일본어)
- **아이콘**: Heroicons
- **배포**: Docker, Docker Compose
- **CI/CD**: GitHub Actions (자동 테스트 및 배포)

## 📚 API 문서

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### IP 감지
- `GET /api/ip` - 현재 공인 IP 조회

### 설정
- `GET/POST/DELETE /api/config/apikey` - API 키 관리

### DNS 관리
- `GET /api/zones` - Zone 목록
- `GET/POST/PUT/DELETE /api/records` - DNS 레코드 CRUD

### DDNS 갱신
- `GET/POST /api/ddns/update` - 자동 갱신 상태/실행

## 🔒 보안 고려사항

- JWT 토큰 기반 인증
- API 키는 로컬 저장 (휴지 암호화 권장)
- 프로덕션에서는 HTTPS 권장
- 정기적인 비밀번호 변경 권장
- 셀프호스트 배포에서 네트워크 격리

## 🌟 DDNS를 셀프호스트해야 하는 이유

### 🏠 홈랩에 완벽
- **홈 서버**: NAS, 미디어 서버, 개발 머신
- **IoT 기기**: 라즈베리파이, 임베디드 시스템
- **원격 접근**: SSH, VPN, 어디서든 웹 서비스

### 🏢 기업 이점
- **비용 제어**: 대규모 배포에서 도메인당 수수료 없음
- **규정 준수**: DNS 데이터를 사내에 보관
- **통합**: 사용자 정의 워크플로 및 자동화
- **확장성**: 제한 없이 수백 개의 도메인 처리

### 🔧 개발자 이점
- **완전한 제어**: 기능 수정 및 확장
- **속도 제한 없음**: DNS 프로바이더가 허용하는 범위를 넘어서
- **로컬 개발**: 외부 의존성 없이 변경 사항 테스트
- **오픈 소스**: 커뮤니티에 개선 사항 기여

## 📚 유용한 링크

### 🛠️ 개발 도구
- [Cursor AI](https://cursor.sh/) - AI 기반 코드 에디터
- [Claude Sonnet](https://www.anthropic.com/claude) - AI 어시스턴트

### 🌐 서비스
- [Cloudflare](https://www.cloudflare.com/) - DNS 및 CDN 서비스
- [Docker Hub](https://hub.docker.com/r/gmkseta/ddns-ui) - 컨테이너 레지스트리

### 📖 문서
- [Cloudflare API](https://developers.cloudflare.com/api/) - DNS API 문서
- [Next.js](https://nextjs.org/) - React 프레임워크
- [Docker](https://docs.docker.com/) - 컨테이너화 가이드

## 🙏 크레딧

- **개발**: AI 페어 프로그래밍 (Cursor + Claude Sonnet 4)
- **디자인**: 토스 디자인 시스템에서 영감
- **인프라**: Cloudflare 무료 플랜 활용
- **커뮤니티**: Docker Hub 및 오픈소스 생태계

---

💡 **팁**: 기존 DDNS 서비스 대비 연간 $25-55를 절약하면서 더 나은 성능, 더 많은 기능, DNS 인프라에 대한 완전한 제어권을 얻으세요!
