// 로컬 스토리지 키들
export const STORAGE_KEYS = {
  selectedApiKey: 'ddns-ui-selected-api-key',
  selectedZone: 'ddns-ui-selected-zone',
} as const;

// API 엔드포인트들
export const API_ENDPOINTS = {
  auth: {
    me: '/api/auth/me',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
  },
  config: {
    apikey: '/api/config/apikey',
  },
  ip: '/api/ip',
  zones: '/api/zones',
  records: '/api/records',
  ddns: {
    update: '/api/ddns/update',
    toggle: '/api/ddns/toggle',
  },
  export: '/api/export',
  import: '/api/import',
} as const; 