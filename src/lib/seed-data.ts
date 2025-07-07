import { db } from './database';

interface MockDNSRecord {
  zone_id: string;
  name: string;
  type: string;
  content: string;
  ttl: number;
  proxied: boolean;
  auto_update: boolean;
}

interface MockUpdateLog {
  record_id: string;
  old_ip: string;
  new_ip: string;
  status: 'success' | 'error';
  message: string;
  trigger_type: 'auto' | 'manual';
  created_at: string;
}

// 개발환경용 더미 데이터
const mockApiKey = {
  id: 'dev-api-key',
  token: 'dev_cloudflare_api_token_123456',
  name: 'Development API Key',
  created_at: new Date().toISOString()
};

const mockZone = {
  id: 'dev-zone-1',
  name: 'example.com',
  api_key_id: 'dev-api-key',
  created_at: new Date().toISOString()
};

const mockDNSRecords: MockDNSRecord[] = [
  {
    zone_id: 'dev-zone-1',
    name: '@',
    type: 'A',
    content: '192.168.1.100',
    ttl: 1,
    proxied: true,
    auto_update: true
  },
  {
    zone_id: 'dev-zone-1',
    name: 'www',
    type: 'CNAME',
    content: 'example.com',
    ttl: 1,
    proxied: false,
    auto_update: false
  },
  {
    zone_id: 'dev-zone-1',
    name: 'mail',
    type: 'A',
    content: '192.168.1.100',
    ttl: 300,
    proxied: false,
    auto_update: true
  },
  {
    zone_id: 'dev-zone-1',
    name: 'blog',
    type: 'A',
    content: '10.0.0.50',
    ttl: 3600,
    proxied: true,
    auto_update: false
  },
  {
    zone_id: 'dev-zone-1',
    name: 'api',
    type: 'A',
    content: '192.168.1.200',
    ttl: 1,
    proxied: true,
    auto_update: true
  }
];

const generateMockUpdateLogs = (): MockUpdateLog[] => {
  const now = new Date();
  const logs: MockUpdateLog[] = [];
  
  // 최근 24시간 동안의 로그 생성
  for (let i = 0; i < 20; i++) {
    const hoursAgo = i * 2; // 2시간 간격
    const logTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const oldIp = `192.168.1.${50 + Math.floor(i / 4)}`;
    const newIp = `192.168.1.${51 + Math.floor(i / 4)}`;
    
    logs.push({
      record_id: `dev-record-${(i % 3) + 1}`, // 3개 레코드에 대해 반복
      old_ip: oldIp,
      new_ip: i % 5 === 0 ? oldIp : newIp, // 5번째마다 IP 변경 없음
      status: i % 7 === 0 ? 'error' : 'success', // 7번째마다 에러
      message: i % 5 === 0 ? 'IP 변경 없음' : 
               i % 7 === 0 ? 'Cloudflare API 오류' : 
               'IP 변경 감지됨',
      trigger_type: i % 3 === 0 ? 'manual' : 'auto',
      created_at: logTime.toISOString().slice(0, 19) // SQLite 형식
    });
  }
  
  return logs;
};

// 개발환경에서만 시드 데이터 삽입
export const seedDevelopmentData = async () => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // 기존 개발 데이터 확인
      db.get(
        "SELECT COUNT(*) as count FROM api_keys WHERE id = ?",
        [mockApiKey.id],
        (err: Error | null, row: { count: number }) => {
          if (err) {
            console.error('Error checking seed data:', err);
            reject(err);
            return;
          }

          // 이미 시드 데이터가 있으면 건너뛰기
          if (row.count > 0) {
            console.log('Development seed data already exists');
            resolve();
            return;
          }

          // API 키 삽입
          db.run(
            "INSERT INTO api_keys (id, token, name, created_at) VALUES (?, ?, ?, ?)",
            [mockApiKey.id, mockApiKey.token, mockApiKey.name, mockApiKey.created_at],
            (err: Error | null) => {
              if (err) console.error('Error inserting API key:', err);
            }
          );

          // Zone 삽입
          db.run(
            "INSERT INTO zones (id, name, api_key_id, created_at) VALUES (?, ?, ?, ?)",
            [mockZone.id, mockZone.name, mockZone.api_key_id, mockZone.created_at],
            (err: Error | null) => {
              if (err) console.error('Error inserting zone:', err);
            }
          );

          // DNS 레코드 삽입
          mockDNSRecords.forEach((record, index) => {
            const recordId = `dev-record-${index + 1}`;
            db.run(
              `INSERT INTO dns_records 
               (id, zone_id, name, type, content, ttl, proxied, auto_update, created_at, updated_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                recordId,
                record.zone_id,
                record.name,
                record.type,
                record.content,
                record.ttl,
                record.proxied ? 1 : 0,
                record.auto_update ? 1 : 0,
                new Date().toISOString(),
                new Date().toISOString()
              ],
              (err: Error | null) => {
                if (err) console.error('Error inserting DNS record:', err);
              }
            );
          });

          // 업데이트 로그 삽입
          const mockLogs = generateMockUpdateLogs();
          mockLogs.forEach((log) => {
            db.run(
              `INSERT INTO update_logs 
               (record_id, old_ip, new_ip, status, message, trigger_type, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                log.record_id,
                log.old_ip,
                log.new_ip,
                log.status,
                log.message,
                log.trigger_type,
                log.created_at
              ],
              (err: Error | null) => {
                if (err) console.error('Error inserting update log:', err);
              }
            );
          });

          console.log('Development seed data inserted successfully');
          resolve();
        }
      );
    });
  });
};

// Cloudflare API 응답을 모킹하는 함수
export const getMockCloudflareData = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return {
    zones: [{
      id: mockZone.id,
      name: mockZone.name,
      status: 'active',
      account: {
        id: 'dev-account',
        name: 'Development Account'
      }
    }],
    records: mockDNSRecords.map((record, index) => ({
      id: `dev-record-${index + 1}`,
      zone_id: record.zone_id,
      zone_name: mockZone.name,
      name: record.name === '@' ? mockZone.name : `${record.name}.${mockZone.name}`,
      type: record.type,
      content: record.content,
      ttl: record.ttl,
      proxiable: record.type === 'A' || record.type === 'AAAA' || record.type === 'CNAME',
      proxied: record.proxied,
      locked: false,
      created_on: new Date().toISOString(),
      modified_on: new Date().toISOString()
    }))
  };
};