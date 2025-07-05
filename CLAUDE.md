# CLAUDE.md


## 🧭 목적

Claude Code와 MCP Server를 기반으로 Jira, GitHub, Playwright, Context7 등을 활용하여 업무 자동화를 수행하는 개발 가이드입니다. 본 문서는 LLM이 작업을 수행할 때 따라야 할 규칙과 흐름을 정의하며, 모든 커밋과 PR, 테스트, 문서화는 해당 규칙을 따릅니다.

CI/CD 및 Slack 연동은 포함하지 않으며, Smart Commit과 PR 자동화를 중심으로 구성합니다.

---

## ⚙️ 기본 원칙

* **모든 작업은 MCP Server와 연동된 context 기반으로 수행해야 합니다.**
* Epic/Task는 Jira에서 관리되며, 작업 단위는 반드시 명확한 ID(Task Key)를 가져야 합니다.
* Git 커밋 및 PR에는 Jira Task ID를 포함해야 하며, smart commit 규칙을 준수해야 합니다.
* 테스트 코드는 Playwright 기반으로 작성하며, 필요 시 Claude에게 자동 생성을 요청합니다.
* 모든 작업 파일에는 클래스/파일 작성 가이드를 따라야 하며, 300줄 이내로 유지해야 합니다.

---

## 🔄 업무 흐름 요약

```
Epic 생성 → Task 분할(TODO) → MCP Server context 지정
→ Task DOING 전환 → 작업 → Smart Commit → PR 생성 및 승인
→ DONE 상태 전환
```

---

## 🗂️ 작업 절차

### 1. Epic & Task 정의

* Jira에 Epic 등록 후, 하위 작업을 Task로 나눕니다.
* 각 Task는 `TODO` 상태로 시작하며, 다음 정보를 포함해야 합니다:

  * Summary, 상세 설명, 예상 결과, Jira Task ID

---

### 2. MCP Server Context 등록

* 작업할 Task에 대해 MCP Server API를 통해 context를 등록합니다.

#### 예시 (API 호출):

```bash
curl -X POST https://your-mcp-server/api/contexts \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "AUTH-12",
    "summary": "로그인 API 개발",
    "description": "JWT 기반 로그인 로직과 예외 처리 구현"
  }'
```

* Claude는 MCP Server에서 설정된 context를 기반으로 커밋 메시지, 테스트, 요약 등을 자동 생성합니다.

---

### 3. 작업 시작 & Smart Commit

* 작업을 시작할 때 Task 상태를 `DOING`으로 변경합니다.
* MCP Server에서 context를 열어 실제 작업을 수행합니다:

```bash
claude context "AUTH-12" --open
```

* 커밋 시 Jira Smart Commit 규칙을 사용합니다:

```bash
git commit -m "AUTH-12 #in-progress feat: 로그인 API 구현"
```

* 완료 후:

```bash
git commit -m "AUTH-12 #done fix: 로그인 예외 처리 완료"
```

---

### 4. PR 생성 및 자동 승인

* 작업 완료 후 Claude에게 PR을 요청합니다:

```bash
claude pr "AUTH-12"
```

* PR 자동화:

  * PR 제목 및 본문 자동 생성
  * PR 자동 Approve
  * Smart Commit을 통해 Jira 상태 자동 전환 (`READY TO RELEASE`, `DONE` 등)

---

### 5. Playwright 테스트 자동화

* 필요한 경우 Claude에게 테스트 생성을 요청합니다:

```bash
claude test generate --task "AUTH-12"
```

* Claude는 관련 테스트 템플릿을 자동 생성하고 파일에 통합합니다.

---

### 6. Context7 기반 맥락 저장

* Claude는 모든 작업 context를 Context7에 저장합니다.
* 이전 작업을 불러오거나 회고 시 다음 명령을 사용합니다:

```bash
claude context resume "AUTH-12"
claude context list
claude summary --sprint "2025-Q3-W2"
```

---

## 📘 클래스/파일 작성 가이드

```typescript
/**
 * 📘 클래스/파일 작성 가이드
 *
 * ✅ 아래 정보를 파일 상단에 주석으로 반드시 작성하세요:
 *
 * 📄 Description:
 *   - 이 클래스 또는 파일의 주요 역할과 책임을 간단히 설명합니다.
 *
 * 🧱 Abstraction Level:
 *   - 이 코드의 추상화 계층을 명시합니다.
 *     예: Entity, ValueObject, DomainService, ApplicationService, Controller, Adapter 등
 *
 * 🔄 Used In:
 *   - 이 클래스가 사용되는 주요 클래스, 모듈, 또는 레이어를 나열합니다.
 *
 * 📌 Notes: (선택)
 *   - 설계 상 주의할 점이나 제한사항이 있다면 작성합니다.
 *
 * ⚠️ 파일 크기는 최대 300줄 미만으로 유지하세요.
 *     책임이 많아지면 클래스를 분리하고, 단일 책임 원칙(SRP)을 지키세요.
 */
```

---

## 📦 예시 명령어

```bash
# MCP Context는 API로 등록 (예시는 본문 참조)

# Context 열기
claude context "AUTH-12" --open

# Smart Commit 예시
git commit -m "AUTH-12 #in-progress feat: 로그인 로직 구현"

# PR 생성
claude pr "AUTH-12"

# 테스트 자동 생성
claude test generate --task "AUTH-12"

# Context 재사용
claude context resume "AUTH-12"
```

---

## 🧩 상태 전이 규칙

| 상태               | 설명         | 자동화 방식                 |
| ---------------- | ---------- | ---------------------- |
| TODO             | 작업 대기      | Jira Task 생성 시 기본 상태   |
| DOING            | 작업 중       | Claude context 열람 후 전환 |
| READY TO RELEASE | PR 생성 시 전환 | Smart Commit으로 자동 처리   |
| DONE             | 완료됨        | PR 머지 및 커밋 시 자동 전환     |

---

## ❗주의사항

* MCP Server를 사용하지 않으면 Claude는 정확한 문맥을 인식하지 못할 수 있습니다.
* 커밋 메시지에 Jira Task ID가 빠지면 Smart Commit 자동 처리가 되지 않습니다.
* 하나의 파일이 300줄을 초과하지 않도록 유지하세요.



This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Cloudflare DDNS Web UI** - a self-hosted web interface for managing DNS records through Cloudflare API with automatic IP updates. It's a Next.js 15 application with TypeScript, SQLite database, and JWT authentication.

## Essential Commands

```bash
# Development (with Turbopack)
yarn dev

# Production build
yarn build

# Start production server
yarn start

# Linting
yarn lint

# Type checking
yarn type-check

# Docker build (multi-arch)
docker buildx build --platform linux/amd64,linux/arm64 -t ddns-ui .

# Run tests
# NOTE: No test runner is currently configured
```

## Architecture Overview

The application follows Next.js App Router patterns with these key architectural decisions:

1. **Component-Based Architecture**: Main page (`/[locale]/page.tsx`) uses modular components to keep files under 300 lines
2. **API Routes**: Backend logic is in `/api/*` endpoints, each handling specific functionality
3. **Database**: SQLite file-based database (`lib/database.ts`) stores users, zones, records, and update logs
4. **Authentication**: JWT tokens managed through `lib/auth.ts` with HTTP-only cookies
5. **Scheduled Updates**: Background IP checking every 5 minutes via `lib/scheduler.ts`
6. **Internationalization**: URL-based routing (`/ko`, `/en`, `/ja`) with complete translations
7. **Tab Navigation**: DNS records and scheduler logs are organized in tabbed interface

## Key Implementation Patterns

### API Endpoints Structure
- All API routes return consistent JSON responses
- Authentication is checked via `verifyToken()` from `lib/auth.ts`
- Database operations use prepared statements for security
- Error handling returns appropriate HTTP status codes

### Frontend State Management
- TanStack Query for server state synchronization
- LocalStorage for UI preferences (theme, language)
- Toast notifications for user feedback
- Real-time UI updates after API calls

### Component Architecture
Main page is componentized for maintainability (keeping each file under 300 lines):
- `DNSTabNavigation`: Tab switching between DNS records and scheduler logs
- `DNSConfigSection`: API key and zone selection UI
- `DNSRecordsTable`: DNS records table with sorting and DDNS management
- `SchedulerLogs`: Scheduler logs with manual/auto trigger type distinction

### DDNS Logic
The core DDNS functionality (`lib/scheduler.ts`) works as follows:
1. Checks current public IP every 5 minutes
2. Updates only A records where DDNS is enabled
3. Automatically converts CNAME records to A records when DDNS is enabled
4. Skips updates if IP hasn't changed

### Database Schema
- `api_keys`: id, token, name, created_at
- `zones`: id, name, api_key_id, created_at  
- `dns_records`: id, zone_id, name, type, content, ttl, proxied, auto_update, created_at, updated_at
- `update_logs`: id, record_id, old_ip, new_ip, status, message, trigger_type ('auto'|'manual'), created_at
- `settings`: key, value, updated_at

## Development Guidelines

### When Adding New Features
1. Check existing patterns in similar components/APIs
2. Maintain internationalization - add keys to all 3 language files
3. Follow the established error handling patterns
4. Use the existing toast notification system for user feedback

### Code Style
- TypeScript strict mode is enabled
- Components use function declarations (not arrow functions)
- API routes use standard Next.js route handlers
- Database queries use parameterized statements

### CI/CD Considerations
- All PRs trigger linting, type checking, and build tests
- Docker builds are tested for both AMD64 and ARM64
- Security scanning via CodeQL and dependency audit
- Main branch deployments automatically push to Docker Hub

## Important Notes

1. **No Test Framework**: Currently no tests exist. When adding tests, you'll need to set up a test runner first.
2. **Single DNS Provider**: Only Cloudflare is supported currently, though the architecture is designed for multi-provider support.
3. **Environment Variables**: Check `.env.example` for required configuration.
4. **Build Warnings**: ESLint and TypeScript errors are ignored during builds (`ignoreDuringBuilds: true` in config).