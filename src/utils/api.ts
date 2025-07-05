import { API_ENDPOINTS } from './constants';

export interface User {
  username: string;
}

export interface APIKey {
  id: string;
  token: string;
  name?: string;
}

export interface Zone {
  id: string;
  name: string;
}

export interface DNSRecord {
  id: string;
  name: string;
  type: string;
  content: string;
  ttl: number;
  proxied: boolean;
  autoUpdate?: boolean;
}

/**
 * 기본 fetch 래퍼 함수
 */
export const apiRequest = async <T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'same-origin',
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return data;
};

/**
 * 현재 사용자 정보 확인
 */
export const checkAuth = async (): Promise<User | null> => {
  try {
    const data = await apiRequest<{ user: User }>(API_ENDPOINTS.auth.me);
    return data.user;
  } catch {
    return null;
  }
};

/**
 * 로그인
 */
export const login = async (username: string, password: string): Promise<User> => {
  const data = await apiRequest<{ user: User }>(API_ENDPOINTS.auth.login, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return data.user;
};

/**
 * 로그아웃
 */
export const logout = async (): Promise<void> => {
  await apiRequest(API_ENDPOINTS.auth.logout, {
    method: 'POST',
  });
};

/**
 * 현재 IP 주소 가져오기
 */
export const getCurrentIP = async (): Promise<string> => {
  const data = await apiRequest<{ ip: string }>(API_ENDPOINTS.ip);
  return data.ip;
};

/**
 * API 키 목록 가져오기
 */
export const getApiKeys = async (): Promise<APIKey[]> => {
  const data = await apiRequest<{ apiKeys: APIKey[] }>(API_ENDPOINTS.config.apikey);
  return data.apiKeys || [];
};

/**
 * Zone 목록 가져오기
 */
export const getZones = async (apiKeyId: string): Promise<Zone[]> => {
  const data = await apiRequest<{ zones: Zone[] }>(
    `${API_ENDPOINTS.zones}?apiKeyId=${apiKeyId}`
  );
  return data.zones || [];
};

/**
 * DNS 레코드 목록 가져오기
 */
export const getRecords = async (zoneId: string, apiKeyId: string): Promise<DNSRecord[]> => {
  const data = await apiRequest<{ records: DNSRecord[] }>(
    `${API_ENDPOINTS.records}?zoneId=${zoneId}&apiKeyId=${apiKeyId}`
  );
  return data.records || [];
};

/**
 * DDNS 업데이트
 */
export const updateDDNS = async (apiKeyId: string): Promise<{
  updated: DNSRecord[];
  errors: { name: string; message?: string; error?: string }[];
  results?: { status: string; name: string; [key: string]: unknown }[];
  currentIP?: string;
  totalRecords?: number;
  totalUpdated?: number;
  totalErrors?: number;
  message?: string;
}> => {
  const data = await apiRequest<{
    updated: DNSRecord[];
    errors: { name: string; message?: string; error?: string }[];
    results?: { status: string; name: string; [key: string]: unknown }[];
    currentIP?: string;
    totalRecords?: number;
    totalUpdated?: number;
    totalErrors?: number;
    message?: string;
  }>(
    API_ENDPOINTS.ddns.update,
    {
      method: 'POST',
      body: JSON.stringify({ apiKeyId }),
    }
  );
  return data;
};

/**
 * DDNS 자동 업데이트 토글 (간단 버전)
 */
export const toggleDDNSAutoUpdate = async (
  recordId: string,
  autoUpdate: boolean,
  zoneId?: string,
  apiKeyId?: string
): Promise<{ success: boolean; recordId: string; autoUpdate: boolean; message: string }> => {
  const data = await apiRequest<{ success: boolean; recordId: string; autoUpdate: boolean; message: string }>(
    API_ENDPOINTS.ddns.toggle,
    {
      method: 'PUT',
      body: JSON.stringify({
        recordId,
        autoUpdate,
        zoneId,
        apiKeyId,
      }),
    }
  );
  return data;
};

 