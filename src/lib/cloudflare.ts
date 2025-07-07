import axios from 'axios';
import { getMockCloudflareData } from './seed-data';

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';

export interface CloudflareZone {
  id: string;
  name: string;
  status: string;
}

export interface CloudflareDNSRecord {
  id: string;
  zone_id: string;
  zone_name: string;
  name: string;
  type: string;
  content: string;
  proxiable: boolean;
  proxied: boolean;
  ttl: number;
  locked: boolean;
}

export class CloudflareAPI {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  // Zone 목록 조회
  async getZones(): Promise<CloudflareZone[]> {
    // 개발 환경에서 모킹 데이터 반환
    if (process.env.NODE_ENV === 'development' && this.apiToken === 'dev_cloudflare_api_token_123456') {
      const mockData = getMockCloudflareData();
      return mockData?.zones || [];
    }

    try {
      const response = await axios.get(`${CLOUDFLARE_API_BASE}/zones`, {
        headers: this.getHeaders(),
      });

      if (!response.data.success) {
        throw new Error(`Cloudflare API Error: ${response.data.errors.map((e: { message: string }) => e.message).join(', ')}`);
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch zones: ${error.message}`);
      }
      throw error;
    }
  }

  // 특정 Zone의 DNS 레코드 조회
  async getDNSRecords(zoneId: string): Promise<CloudflareDNSRecord[]> {
    // 개발 환경에서 모킹 데이터 반환
    if (process.env.NODE_ENV === 'development' && this.apiToken === 'dev_cloudflare_api_token_123456') {
      const mockData = getMockCloudflareData();
      return mockData?.records || [];
    }

    try {
      const response = await axios.get(`${CLOUDFLARE_API_BASE}/zones/${zoneId}/dns_records`, {
        headers: this.getHeaders(),
      });

      if (!response.data.success) {
        throw new Error(`Cloudflare API Error: ${response.data.errors.map((e: { message: string }) => e.message).join(', ')}`);
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch DNS records: ${error.message}`);
      }
      throw error;
    }
  }

  // DNS 레코드 생성
  async createDNSRecord(zoneId: string, record: {
    name: string;
    type: string;
    content: string;
    ttl?: number;
    proxied?: boolean;
  }): Promise<CloudflareDNSRecord> {
    try {
      const response = await axios.post(
        `${CLOUDFLARE_API_BASE}/zones/${zoneId}/dns_records`,
        {
          ...record,
          ttl: record.ttl || 120,
          proxied: record.proxied || false,
        },
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.data.success) {
        throw new Error(`Cloudflare API Error: ${response.data.errors.map((e: { message: string }) => e.message).join(', ')}`);
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to create DNS record: ${error.message}`);
      }
      throw error;
    }
  }

  // DNS 레코드 업데이트
  async updateDNSRecord(zoneId: string, recordId: string, record: {
    name: string;
    type: string;
    content: string;
    ttl?: number;
    proxied?: boolean;
  }): Promise<CloudflareDNSRecord> {
    // 개발 환경에서 모킹 데이터 반환
    if (process.env.NODE_ENV === 'development' && this.apiToken === 'dev_cloudflare_api_token_123456') {
      const mockData = getMockCloudflareData();
      const mockRecord = mockData?.records.find(r => r.id === recordId);
      if (mockRecord) {
        return {
          ...mockRecord,
          ...record,
          ttl: record.ttl || 120,
          proxied: record.proxied || false,
          proxiable: mockRecord.proxiable || false,
          locked: mockRecord.locked || false
        } as CloudflareDNSRecord;
      }
    }

    try {
      const response = await axios.put(
        `${CLOUDFLARE_API_BASE}/zones/${zoneId}/dns_records/${recordId}`,
        {
          ...record,
          ttl: record.ttl || 120,
          proxied: record.proxied || false,
        },
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.data.success) {
        throw new Error(`Cloudflare API Error: ${response.data.errors.map((e: { message: string }) => e.message).join(', ')}`);
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to update DNS record: ${error.message}`);
      }
      throw error;
    }
  }

  // DNS 레코드 삭제
  async deleteDNSRecord(zoneId: string, recordId: string): Promise<void> {
    try {
      const response = await axios.delete(
        `${CLOUDFLARE_API_BASE}/zones/${zoneId}/dns_records/${recordId}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.data.success) {
        throw new Error(`Cloudflare API Error: ${response.data.errors.map((e: { message: string }) => e.message).join(', ')}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to delete DNS record: ${error.message}`);
      }
      throw error;
    }
  }
}

// 현재 공인 IP 조회
export async function getCurrentIP(): Promise<string> {
  // 개발 환경에서 테스트 IP 반환
  if (process.env.NODE_ENV === 'development') {
    return '192.168.1.100';
  }

  const services = [
    'https://api.ipify.org',
    'https://ipv4.icanhazip.com',
    'https://icanhazip.com',
    'https://checkip.amazonaws.com',
  ];

  let lastError: Error | null = null;

  for (const service of services) {
    try {
      console.log(`Trying IP service: ${service}`);
      const response = await axios.get(service, { 
        timeout: 10000,
        headers: {
          'User-Agent': 'DDNS-UI/1.0'
        }
      });
      const ip = response.data.trim();
      console.log(`Got IP from ${service}: ${ip}`);
      return ip;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(`Failed to get IP from ${service}`);
      console.error(`Failed to get IP from ${service}:`, lastError.message);
      continue;
    }
  }

  throw new Error(`Failed to get current IP from all services. Last error: ${lastError?.message}`);
} 