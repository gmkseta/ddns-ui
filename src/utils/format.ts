/**
 * 복수형 처리를 위한 함수
 */
export const formatCount = (count: number, singular: string, plural?: string): string => {
  const pluralForm = plural || `${singular}s`;
  return count === 1 ? `${count} ${singular}` : `${count} ${pluralForm}`;
};

/**
 * TTL 값을 사람이 읽기 쉬운 형태로 변환
 */
export const formatTTL = (ttl: number): string => {
  if (ttl < 60) {
    return `${ttl}초`;
  } else if (ttl < 3600) {
    const minutes = Math.floor(ttl / 60);
    return `${minutes}분`;
  } else if (ttl < 86400) {
    const hours = Math.floor(ttl / 3600);
    return `${hours}시간`;
  } else {
    const days = Math.floor(ttl / 86400);
    return `${days}일`;
  }
};

/**
 * DNS 레코드 타입에 따른 색상 클래스 반환
 */
export const getRecordTypeColor = (type: string): string => {
  switch (type.toUpperCase()) {
    case 'A':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'AAAA':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'CNAME':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'MX':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'TXT':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

/**
 * 에러 메시지를 사용자 친화적으로 변환
 */
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '알 수 없는 오류가 발생했습니다.';
};

/**
 * 바이트를 사람이 읽기 쉬운 형태로 변환
 */
export const formatBytes = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
}; 