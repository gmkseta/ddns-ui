# Docker Compose로 DDNS-UI 실행하기

## 빠른 시작

### 1. 기본 실행 (포트 3000)
```bash
docker-compose up -d
```

### 2. 다른 포트로 실행 (예: 8080)
```bash
HOST_PORT=8080 docker-compose up -d
```

### 3. 스크립트를 사용한 실행
```bash
./start-local.sh
```

## 상세 설정

### 환경 변수 파일 사용

1. `.env.example` 파일을 `.env`로 복사:
```bash
cp .env.example .env
```

2. `.env` 파일 편집:
```env
# 호스트 포트 (기본값: 3000)
HOST_PORT=8080

# 관리자 계정
ADMIN_USERNAME=admin
ADMIN_PASSWORD=my-secure-password

# JWT 시크릿 (보안을 위해 변경 필수!)
JWT_SECRET=my-random-secret-key

# 업데이트 주기 (분)
UPDATE_INTERVAL=5
```

3. Docker Compose 실행:
```bash
docker-compose up -d
```

## 주요 명령어

### 시작
```bash
# 백그라운드 실행
docker-compose up -d

# 로그와 함께 실행
docker-compose up
```

### 중지
```bash
# 컨테이너 중지
docker-compose down

# 볼륨까지 삭제 (데이터 초기화)
docker-compose down -v
```

### 로그 확인
```bash
# 실시간 로그
docker-compose logs -f

# 최근 100줄
docker-compose logs --tail=100
```

### 재시작
```bash
docker-compose restart
```

### 상태 확인
```bash
docker-compose ps
```

## 접속 방법

기본 포트(3000)로 실행한 경우:
- 한국어: http://localhost:3000/ko
- 영어: http://localhost:3000/en
- 일본어: http://localhost:3000/ja

다른 포트(예: 8080)로 실행한 경우:
- 한국어: http://localhost:8080/ko
- 영어: http://localhost:8080/en
- 일본어: http://localhost:8080/ja

## 데이터 저장

- SQLite 데이터베이스는 Docker 볼륨에 저장됩니다
- 볼륨 이름: `ddns-ui_ddns-data`
- 컨테이너를 삭제해도 데이터는 유지됩니다

### 데이터 백업
```bash
# 볼륨 백업
docker run --rm -v ddns-ui_ddns-data:/data -v $(pwd):/backup alpine tar czf /backup/ddns-backup.tar.gz -C /data .
```

### 데이터 복원
```bash
# 볼륨 복원
docker run --rm -v ddns-ui_ddns-data:/data -v $(pwd):/backup alpine tar xzf /backup/ddns-backup.tar.gz -C /data
```

## 문제 해결

### 포트 충돌
```bash
# 다른 포트로 실행
HOST_PORT=8080 docker-compose up -d
```

### 권한 문제
```bash
# Docker 그룹에 사용자 추가 (Linux)
sudo usermod -aG docker $USER
```

### 이미지 업데이트
```bash
# 최신 이미지 받기
docker-compose pull

# 재시작
docker-compose up -d
```

## 개발 모드

로컬에서 빌드하여 실행하려면 `docker-compose.yml`에서:

```yaml
services:
  ddns-ui:
    # image: gmkseta/ddns-ui:latest  # 주석 처리
    build: .  # 주석 해제
```

그 후:
```bash
docker-compose build
docker-compose up -d
```