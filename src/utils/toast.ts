import { showToast } from '@/components/Toast';
import { formatErrorMessage } from './format';

/**
 * 성공 토스트 표시
 */
export const showSuccessToast = (message: string): void => {
  showToast.success(message);
};

/**
 * 에러 토스트 표시
 */
export const showErrorToast = (error: unknown): void => {
  const message = formatErrorMessage(error);
  showToast.error(message);
};

/**
 * 정보 토스트 표시
 */
export const showInfoToast = (message: string): void => {
  showToast.info(message);
};

/**
 * 경고 토스트 표시
 */
export const showWarningToast = (message: string): void => {
  showToast.warning(message);
};

/**
 * API 에러 처리 및 토스트 표시
 */
export const handleApiError = (error: unknown, defaultMessage?: string): void => {
  const message = defaultMessage || formatErrorMessage(error);
  showToast.error(message);
  console.error('API Error:', error);
}; 