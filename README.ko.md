# Cloudflare DDNS Manager

🌐 자동 IP 모니터링 및 업데이트 기능을 갖춘 현대적이고 다국어를 지원하는 웹 기반 다이나믹 DNS(DDNS) 관리 도구

[![Docker Pulls](https://img.shields.io/docker/pulls/gmkseta/ddns-ui)](https://hub.docker.com/r/gmkseta/ddns-ui)
[![GitHub release](https://img.shields.io/github/release/gmkseta/ddns-ui.svg)](https://github.com/gmkseta/ddns-ui/releases)
[![License](https://img.shields.io/github/license/gmkseta/ddns-ui.svg)](LICENSE)

**🌍 언어**: [English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)

## ✨ 기능

- **🌍 다국어 지원**: 한국어, 영어(English), 일본어(日本語)
- **🔄 동적 IP 모니터링**: 공인 IP 주소를 자동으로 감지하고 업데이트
- **☁️ Cloudflare 통합**: Cloudflare DNS API와 직접 통합
- **🎨 현대적인 웹 인터페이스**: 다크/라이트 테마를 지원하는 깔끔하고 반응형 웹 UI
- **📱 모바일 친화적**: 모바일 기기와 태블릿에 최적화
- **🏗️ 다중 Zone 지원**: 여러 Cloudflare Zone의 DNS 레코드 관리
- **⏰ 자동 업데이트**: 설정 가능한 간격으로 자동 IP 확인 및 DNS 업데이트
- **🎛️ 수동 제어**: 즉시 수동 IP 업데이트 및 스케줄러 제어
- **📊 업데이트 로그**: 모든 IP 변경 사항을 상세한 로깅으로 추적
- **💾 내보내기/가져오기**: DNS 설정 백업 및 복원
- **🔒 보안**: 설정 가능한 자격 증명을 사용한 JWT 기반 인증

## 🚀 빠른 시작

> ⚠️ **보안 참고사항**: 기본 자격 증명은 초기 설정용으로만 제공됩니다. 프로덕션에서는 반드시 변경해야 합니다!

### 🎯 가장 빠른 시작 (복사 & 붙여넣기)

```bash
# Docker Compose로 한 줄 설정
curl -O https://raw.githubusercontent.com/gmkseta/ddns-ui/main/docker-compose.yml && \
echo -e "ADMIN_PASSWORD=$(openssl rand -base64 12)\nJWT_SECRET=$(openssl rand -base64 32)" > .env && \
docker-compose up -d && \
echo "✅ DDNS UI가 http://localhost:3000 에서 실행 중입니다" && \
echo "👤 사용자명: admin" && \
echo "🔑 비밀번호: $(grep ADMIN_PASSWORD .env | cut -d'=' -f2)"
```

### 🐳 Docker 사용 (권장)

```bash
# 기본 설정으로 빠른 시작 (나중에 비밀번호 변경!)
docker run -d \
  --name ddns-ui \
  -p 3000:3000 \
  -v ddns-data:/app/data \
  -e ADMIN_PASSWORD=your-secure-password \
  -e JWT_SECRET=$(openssl rand -base64 32) \
  --restart unless-stopped \
  gmkseta/ddns-ui:latest
```

### 🐳 Docker Compose 사용 (가장 쉬움)

**3단계로 빠른 시작:**

```bash
# 1. docker-compose.yml 다운로드
curl -O https://raw.githubusercontent.com/gmkseta/ddns-ui/main/docker-compose.yml

# 2. 보안 비밀번호로 .env 파일 생성
cat > .env << EOF
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=$(openssl rand -base64 32)
EOF

# 3. 서비스 시작
docker-compose up -d
```

**또는 수동으로 `docker-compose.yml` 생성:**

```yaml
version: '3.8'
services:
  ddns-ui:
    image: gmkseta/ddns-ui:latest
    container_name: ddns-ui
    ports:
      - "${HOST_PORT:-3000}:3000"
    environment:
      # 관리자 자격 증명 (이것들을 변경하세요!)
      - ADMIN_USERNAME=${ADMIN_USERNAME:-admin}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-changeme}
      # JWT 시크릿 키 (프로덕션에서는 반드시 변경!)
      - JWT_SECRET=${JWT_SECRET:-your-random-jwt-secret-key}
      # 업데이트 간격(분)
      - UPDATE_INTERVAL=${UPDATE_INTERVAL:-5}
      - NODE_ENV=production
    volumes:
      - ddns-data:/app/data
    restart: unless-stopped

volumes:
  ddns-data:
```

2. 설정을 위한 `.env` 파일 생성:
```bash
# 예제 복사 및 편집
cp .env.example .env

# 또는 수동 생성
cat > .env << EOF
HOST_PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=$(openssl rand -base64 32)
UPDATE_INTERVAL=5
EOF
```

3. 서비스 시작:
```bash
docker-compose up -d
```

**최신 버전으로 업데이트하기:**
```bash
# 최신 이미지 pull 후 재시작
docker-compose pull && docker-compose up -d

# 또는 구버전 docker-compose 사용 시
docker pull gmkseta/ddns-ui:latest
docker-compose down && docker-compose up -d
```

### 🖥️ 로컬 개발 설정

```bash
# 저장소 복제
git clone https://github.com/gmkseta/ddns-ui.git
cd ddns-ui

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

브라우저를 열고 `http://localhost:3000`으로 이동하세요

## 🔧 설정

### 최초 설정

1. `http://localhost:3000`에서 웹 인터페이스에 접속
2. 기본 자격 증명으로 로그인:
   - 사용자명: `admin`
   - 비밀번호: `changeme`
3. **⚠️ 보안 경고**: 첫 로그인 후 즉시 기본 비밀번호를 변경하세요!
4. 선호하는 언어 선택 (한국어/영어/일본어)
5. Cloudflare API 자격 증명 추가:
   - API 키 섹션으로 이동
   - Cloudflare API 토큰 또는 글로벌 API 키 추가
   - Zone을 선택하고 DNS 레코드 구성

### Cloudflare API 설정

다음 중 하나가 필요합니다:

**옵션 1: API 토큰 (권장)**
- [Cloudflare API 토큰](https://dash.cloudflare.com/profile/api-tokens)으로 이동
- `Zone:Read` 및 `DNS:Edit` 권한으로 토큰 생성
- 특정 Zone에 범위 지정

**옵션 2: 글로벌 API 키**
- [Cloudflare API 섹션](https://dash.cloudflare.com/profile/api-tokens)으로 이동
- 글로벌 API 키 + 이메일 주소 사용

### DNS 레코드 설정

1. API 키와 Zone 선택
2. DDNS 업데이트를 위해 모니터링할 DNS 레코드 선택
3. 업데이트 간격 설정 (권장: 5-30분)
4. 자동 작동을 위해 자동 업데이트 활성화
5. 스케줄러 로그 탭에서 변경 사항 모니터링

## 📱 지원 언어

- **한국어** - 완전한 현지화
- **English** - 완전한 현지화
- **日本語 (Japanese)** - 완전한 현지화

인터페이스는 브라우저 언어를 자동으로 감지하여 전환합니다. 헤더의 언어 스위처를 사용하여 수동으로 언어를 변경할 수도 있습니다.

## 🌐 환경 변수

| 변수 | 설명 | 기본값 | 필수 |
|------|------|--------|------|
| `ADMIN_USERNAME` | 관리자 로그인 사용자명 | `admin` | ⚠️ 변경 |
| `ADMIN_PASSWORD` | 관리자 로그인 비밀번호 | `changeme` | ⚠️ 변경 |
| `JWT_SECRET` | JWT 토큰 시크릿 키 | - | ✅ 예 |
| `DATABASE_PATH` | SQLite 데이터베이스 파일 경로 | `./data/ddns.db` | 아니오 |
| `UPDATE_INTERVAL` | 업데이트 간격 (분) | `5` | 아니오 |
| `NODE_ENV` | 애플리케이션 환경 | `development` | 아니오 |
| `PORT` | 서버 포트 | `3000` | 아니오 |

## 📡 API 엔드포인트

애플리케이션은 통합을 위한 REST API를 제공합니다:

- `GET /api/ip` - 현재 공인 IP 가져오기
- `GET /api/zones` - Cloudflare Zone 목록
- `GET /api/records` - DNS 레코드 목록
- `POST /api/records/update` - DNS 레코드 업데이트
- `GET /api/logs` - 업데이트 로그 가져오기
- `POST /api/export` - 설정 내보내기
- `POST /api/import` - 설정 가져오기

## 💾 데이터 지속성

모든 데이터는 컨테이너 내부의 `/app/data/ddns.db`에 위치한 SQLite 데이터베이스에 저장됩니다. 컨테이너 재시작 시에도 설정이 유지되도록 이 디렉토리를 볼륨으로 마운트하세요.

데이터베이스에는 다음이 포함됩니다:
- 사용자 인증 데이터
- Cloudflare API 키와 Zone
- DNS 레코드 설정
- 업데이트 로그 및 스케줄러 기록
- 애플리케이션 설정

## 🔒 보안

- **기본 비밀번호 변경**: 항상 기본 로그인 자격 증명을 변경하세요
- **API 키 보안**: API 키는 안전하게 저장되며 내보내기/가져오기 가능
- **JWT 인증**: 설정 가능한 만료 시간을 가진 세션 기반 인증
- **네트워크 접근**: HTTPS를 사용하는 리버스 프록시 뒤에서 실행 고려
- **정기 백업**: 내보내기 기능을 사용하여 설정 백업
- **입력 검증**: 모든 입력은 검증되고 위생 처리됨

## 🛠️ 문제 해결

### 일반적인 문제

1. **Cloudflare API에 연결할 수 없음**
   - API 토큰/키가 올바른지 확인
   - 토큰 권한에 Zone:Read 및 DNS:Edit가 포함되어 있는지 확인
   - Zone ID가 올바른지 확인

2. **IP 감지가 작동하지 않음**
   - 앱은 IP 감지를 위해 ipify.org(무료 서비스)를 사용합니다
   - 네트워크 연결 확인
   - 방화벽이 아웃바운드 요청을 차단하지 않는지 확인

3. **컨테이너가 시작되지 않음**
   - 포트 3000이 이미 사용 중인지 확인
   - Docker에 충분한 권한이 있는지 확인
   - 컨테이너 로그 확인: `docker logs ddns-ui`

4. **루트 경로가 404를 반환함**
   - Turbopack을 사용하는 개발 모드에서는 정상입니다
   - `/en`, `/ko`, 또는 `/ja`로 직접 접근
   - 프로덕션에서는 루트 경로가 올바르게 리다이렉트됩니다

### 로그

애플리케이션 로그 보기:
```bash
# Docker
docker logs ddns-ui

# Docker Compose
docker-compose logs ddns-ui
```

## 🏗️ 기술 스택

- **프론트엔드**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **백엔드**: Next.js API Routes, SQLite
- **국제화**: next-intl
- **인증**: JWT
- **UI 컴포넌트**: 다크/라이트 테마를 지원하는 커스텀 컴포넌트
- **빌드**: 최적화된 캐싱을 사용한 Docker 다단계 빌드

## 🤝 기여하기

기여를 환영합니다! 자유롭게 Pull Request를 제출해 주세요.

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경 사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시 (`git push origin feature/AmazingFeature`)
5. Pull Request 열기

## 🚀 개발 & CI/CD

### 🤖 자동화된 워크플로우

모든 Pull Request는 자동으로 실행됩니다:
- 🔍 **ESLint**: 코드 스타일 및 품질 검사
- 🏷️ **TypeScript**: 타입 안전성 검증
- 🏗️ **빌드 테스트**: 프로덕션 빌드가 작동하는지 확인
- 🐳 **Docker 빌드**: 컨테이너 이미지 검증
- 🔒 **보안 스캔**: 의존성 취약점 검사

`main`에 병합될 때:
- 🐳 **Docker Hub**: 자동 멀티 아키텍처 이미지 빌드 (AMD64/ARM64)
- 📦 **버전 관리**: 시맨틱 버전 태깅
- 🔒 **보안**: 컨테이너 취약점 스캔

## 💰 비용 비교

### 기존 DDNS 서비스 대신 이것을 선택해야 하는 이유?

| 서비스 | 가격 | 도메인 | 갱신 | 제한사항 |
|--------|------|--------|------|----------|
| **NoIP** | 무료/유료 | 제한된 도메인 | 30일마다 수동 | 기능 제한 |
| **DynDNS** | $55/년 | 제한된 도메인 | 자동 | 월간 구독 |
| **Duck DNS** | 무료 | 서브도메인만 | 자동 | 커스텀 도메인 없음 |
| **🌟 이 프로젝트** | **무료** | **자신의 도메인** | **자동** | **제한 없음** |

### 셀프 호스팅의 이점
- **완전한 제어**: 데이터가 여러분의 것으로 유지됩니다
- **비용 절감**: 기존 서비스의 연간 $25-55 대비 $0
- **뛰어난 성능**: 99.9% 업타임을 가진 Cloudflare의 글로벌 CDN
- **전문 기능**: 다중 도메인 지원, 웹 인터페이스, 백업/복원

## 🌟 AI로 개발됨

이 프로젝트는 현대적인 개발 도구와 함께 **AI 지원 프로그래밍**을 사용하여 개발되었으며, 다음과 같은 결과를 가져왔습니다:
- ⚡ **빠른 개발**: 아이디어에서 구현까지 즉시
- 🔍 **코드 품질**: AI가 적용한 모범 사례
- 📚 **포괄적인 문서**: 자동 생성된 가이드
- 🐛 **버그 예방**: 실시간 코드 분석

## 📄 라이선스

이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여됩니다 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## ☕ 후원

이 프로젝트가 도움이 되었다면, 커피 한 잔 사주는 것을 고려해 주세요!

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow?style=for-the-badge&logo=buy-me-a-coffee)](https://buymeacoffee.com/gmkseta)

## 💬 지원 & 이슈

문제가 발생하거나 질문이 있으시면:
- GitHub에 [이슈 열기](https://github.com/gmkseta/ddns-ui/issues)
- 위의 [문제 해결 섹션](#-문제-해결) 확인
- 유사한 문제에 대한 기존 이슈 검토

## 🌟 스타 히스토리

이 프로젝트가 마음에 드신다면, GitHub에서 ⭐를 주세요!

---

💡 **프로 팁**: 기존 DDNS 서비스와 비교하여 연간 $25-55를 절약하면서 더 나은 성능, 더 많은 기능, DNS 인프라에 대한 완전한 제어를 얻으세요!