#!/bin/bash

# DDNS-UI 로컬 실행 스크립트

echo "🚀 DDNS-UI 로컬 실행 준비 중..."

# .env 파일 확인
if [ ! -f .env ]; then
    echo "📝 .env 파일이 없습니다. .env.example을 복사합니다..."
    cp .env.example .env
    echo "⚠️  .env 파일의 설정을 확인하고 필요시 수정하세요!"
    echo ""
fi

# 현재 설정 표시
if [ -f .env ]; then
    source .env
    echo "📋 현재 설정:"
    echo "   - 포트: ${HOST_PORT:-3000}"
    echo "   - 관리자: ${ADMIN_USERNAME:-admin}"
    echo "   - 업데이트 주기: ${UPDATE_INTERVAL:-5}분"
    echo ""
fi

# Docker Compose 실행
echo "🐳 Docker Compose로 애플리케이션을 시작합니다..."
docker-compose up -d

# 상태 확인
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ DDNS-UI가 성공적으로 시작되었습니다!"
    echo ""
    echo "🌐 접속 주소:"
    echo "   - 한국어: http://localhost:${HOST_PORT:-3000}/ko"
    echo "   - 영어: http://localhost:${HOST_PORT:-3000}/en"
    echo "   - 일본어: http://localhost:${HOST_PORT:-3000}/ja"
    echo ""
    echo "📊 유용한 명령어:"
    echo "   - 로그 보기: docker-compose logs -f"
    echo "   - 중지: docker-compose down"
    echo "   - 재시작: docker-compose restart"
    echo "   - 상태 확인: docker-compose ps"
else
    echo "❌ 시작 실패! 다음을 확인하세요:"
    echo "   - Docker가 실행 중인지 확인"
    echo "   - 포트가 사용 중인지 확인"
    echo "   - docker-compose logs 로 에러 확인"
fi