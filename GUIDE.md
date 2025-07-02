# Cloudflare DDNS Web UI

## ⚡️ 프로젝트 개요

Cloudflare DNS API를 활용한 **DDNS 관리 웹 UI**를 구축한다.

* ☑️ DDNS 서버 내에 Docker로 배포
* ☑️ Web UI에서 **API Key**, **Zone 선택**, **CNAME 레코드 추가/삭제/편집** 가능
* ☑️ 공인 IP 조회 및 갱신
* ☑️ 설정된 레코드 자동 갱신 주기 설정 가능 (ex. 5분)
* ☑️ 로그인 기능 포함 (Docker 실행 시 환경변수로 어드민 ID/비밀번호 전달)

## 🤖 기술 스택

* **Frontend**: Next.js (App Router), TailwindCSS
* **Backend**: Node.js (Next API route or separate Express server)
* **Infra**:

  * Dockerized deployment
  * `curl` 또는 `ddclient`로 IP 갱신
  * Cloudflare DNS API
  * 데이터 저장: SQLite (내장형 경량 DB)

## 🚀 주요 기능 정의

### 1. 사용자 UI

* 로그인 기능

  * Docker 실행 시 환경변수로 전달된 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 값으로 로그인

* API Key 등록 화면

  * Bearer API Token 입력
  * 저장 시 서버에 POST, SQLite에 저장됨

* Zone(도메인) 선택

  * API Key로 zone 목록 조회
  * 선택한 zone에 따라 레코드 설정 가능

* 레코드 관리 화면

  * 등록된 A/CNAME 레코드 리스트 조회
  * 추가/편집/삭제 가능
  * 연결된 공인 IP 기준으로 zone/레코드별로 시각화

* JSON Import/Export 기능

  * 설정된 DDNS 정보들을 JSON 형식으로 내보내기 / 가져오기 가능

* 현재 공인 IP 확인

* 특정 레코드 자동 갱신 활성화 여부 설정 (toggle)

### 2. 서버 사이드

* `/api/ip` → 현재 서버 공인 IP 반환 (`https://ipv4.icanhazip.com` 활용)
* `/api/zones` → API 키로 zone 목록 조회
* `/api/records?zoneId=xxx` → 해당 zone 내 레코드 조회
* `/api/record` → POST/PUT/DELETE: 레코드 추가/수정/삭제
* `/api/config` → API Key 저장, 레코드 갱신 주기 설정 등
* `/api/export` → 설정 JSON export
* `/api/import` → 설정 JSON import
* 내부 `cron` 또는 `setInterval` 로 특정 레코드 자동 갱신 (IP 변경된 경우만 PUT 요청)

## ⚙️ DDNS 갱신 로직

* 초기: 사용자가 CNAME 또는 A 레코드 추가할 때 "자동 갱신" 여부 지정
* 이후: 주기적으로 현재 IP 확인 → 설정된 레코드들과 비교
* 변경된 경우 Cloudflare DNS API로 레코드 업데이트

```bash
curl -X PUT https://api.cloudflare.com/client/v4/zones/<ZONE_ID>/dns_records/<RECORD_ID> \
  -H "Authorization: Bearer <API_TOKEN>" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "A",
    "name": "ai.seongjun.kr",
    "content": "123.123.123.123",
    "ttl": 120,
    "proxied": false
  }'
```

## 🛋️ 설정 저장 위치

* SQLite DB 파일 (예: `data/db.sqlite3`)
* JSON 파일로 내보내기/불러오기 지원
* 기본 구조 예시 (JSON Export 형태):

```json
{
  "auth": {
    "username": "admin",
    "password": "mypassword"
  },
  "apiKeys": [
    {
      "token": "<API_KEY>",
      "zones": [
        {
          "id": "<ZONE_ID>",
          "name": "seongjun.kr",
          "records": [
            {
              "id": "...",
              "name": "ai",
              "type": "A",
              "proxied": false,
              "autoUpdate": true
            }
          ]
        }
      ]
    }
  ]
}
```

## 🔢 데이터 흐름 요약

1. 사용자 웹 UI 접속 → 로그인 (Docker 실행 시 환경변수 기반)
2. API Key 입력 → zone 목록 fetch → 사용자 선택
3. zone 내 레코드 목록 표시
4. 레코드 추가 (자동 갱신 옵션 포함) → 서버에 저장 + Cloudflare API 호출
5. 주기적 IP 체크 → 변경된 경우 Cloudflare에 업데이트

## 👊 목표

* 로컬 Docker 단일 명령으로 UI + DDNS 자동 갱신 서버 실행
* 간편한 Web UI로 누구나 쉽게 레코드 갱신 설정 가능
* 향후 모바일 대응 및 인증 기능 확장 고려 가능

---

필요 시:

* 인증 설정 (Docker run 시 환경변수로 ID/PW 전달)
* Proxy 설정 관리 (`proxied: true/false`)
* 로그 뷰어 탭 (갱신 날짜/경로 확인 등)
* `*.seongjun.kr`에 대한 와일드카드 갱신 시나리오도 별도 모듈로 확장 가능
