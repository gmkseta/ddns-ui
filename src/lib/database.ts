/* eslint-disable */
// @ts-nocheck
import path from 'path';
import fs from 'fs';

// 빌드 시에는 SQLite 모듈 로드 건너뛰기
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                   process.env.NODE_ENV === 'test' ||
                   typeof window !== 'undefined';

let sqlite3: any;
let db: any;

if (!isBuildTime) {
  sqlite3 = require('sqlite3');
  
  // 데이터베이스 경로 설정
  const dbPath = process.env.DATABASE_PATH || './data/db.sqlite3';
  const dataDir = path.dirname(dbPath);

  // 데이터 디렉토리가 없으면 생성
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // SQLite 데이터베이스 연결
  db = new sqlite3.Database(dbPath);
} else {
  // 빌드 시에는 mock 객체 사용
  db = {
    get: () => Promise.resolve(null),
    all: () => Promise.resolve([]),
    run: () => Promise.resolve({ lastID: 1 }),
    serialize: () => {},
  };
}

export { db };

// 데이터베이스 초기화
export const initDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // API 키 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS api_keys (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          token TEXT UNIQUE NOT NULL,
          name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 기존 테이블에 name 컬럼 추가 (없을 경우에만)
      db.run(`ALTER TABLE api_keys ADD COLUMN name TEXT`, (err) => {
        // 이미 컬럼이 있으면 에러 무시
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding name column:', err);
        }
      });

      // Zone 테이블  
      db.run(`
        CREATE TABLE IF NOT EXISTS zones (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          api_key_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (api_key_id) REFERENCES api_keys (id)
        )
      `);

      // DNS 레코드 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS dns_records (
          id TEXT PRIMARY KEY,
          zone_id TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          content TEXT NOT NULL,
          ttl INTEGER DEFAULT 120,
          proxied BOOLEAN DEFAULT false,
          auto_update BOOLEAN DEFAULT false,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (zone_id) REFERENCES zones (id)
        )
      `);

      // 설정 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 로그 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS update_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          record_id TEXT NOT NULL,
          old_ip TEXT,
          new_ip TEXT,
          status TEXT NOT NULL,
          message TEXT,
          trigger_type TEXT DEFAULT 'auto',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (record_id) REFERENCES dns_records (id)
        )
      `);

      // trigger_type 컬럼 추가 (기존 테이블용)
      db.run(`ALTER TABLE update_logs ADD COLUMN trigger_type TEXT DEFAULT 'auto'`, (err) => {
        // 이미 컬럼이 있으면 에러 무시
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding trigger_type column:', err);
        }
        resolve();
      });
    });
  });
};

// 데이터베이스 쿼리 헬퍼
export const dbGet = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err: any, row: any) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err: any, rows: any) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbRun = (sql: string, params: any[] = []): Promise<{ lastID?: number }> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

// 데이터베이스 초기화 실행 (빌드 시에는 건너뛰기)
if (typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build') {
  initDatabase()
    .then(async () => {
      // 개발 환경에서 시드 데이터 삽입
      if (process.env.NODE_ENV === 'development') {
        const { seedDevelopmentData } = await import('./seed-data');
        await seedDevelopmentData();
      }
    })
    .catch(console.error);
} 