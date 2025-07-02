import { STORAGE_KEYS } from './constants';

/**
 * 로컬 스토리지에서 값을 가져오는 함수
 */
export const getFromStorage = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
};

/**
 * 로컬 스토리지에 값을 저장하는 함수
 */
export const setToStorage = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
};

/**
 * 로컬 스토리지에서 값을 제거하는 함수
 */
export const removeFromStorage = (key: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
};

/**
 * 선택된 API 키를 가져오는 함수
 */
export const getSelectedApiKey = (): string | null => {
  return getFromStorage(STORAGE_KEYS.selectedApiKey);
};

/**
 * 선택된 API 키를 저장하는 함수
 */
export const setSelectedApiKey = (apiKeyId: string): void => {
  setToStorage(STORAGE_KEYS.selectedApiKey, apiKeyId);
};

/**
 * 선택된 Zone을 가져오는 함수
 */
export const getSelectedZone = (): string | null => {
  return getFromStorage(STORAGE_KEYS.selectedZone);
};

/**
 * 선택된 Zone을 저장하는 함수
 */
export const setSelectedZone = (zoneId: string): void => {
  setToStorage(STORAGE_KEYS.selectedZone, zoneId);
}; 