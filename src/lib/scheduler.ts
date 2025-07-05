import { getCurrentIP, CloudflareAPI } from './cloudflare';
import { dbRun, dbAll } from './database';

class DDNSScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  // 스케줄러 시작
  start(intervalMinutes: number = 5) {
    if (this.intervalId) {
      console.log('DDNS Scheduler is already running');
      return;
    }

    console.log(`Starting DDNS Scheduler with ${intervalMinutes} minute interval`);
    
    // 즉시 한 번 실행
    this.runUpdate();

    // 주기적 실행 설정
    this.intervalId = setInterval(() => {
      this.runUpdate();
    }, intervalMinutes * 60 * 1000);
  }

  // 스케줄러 중지
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('DDNS Scheduler stopped');
    }
  }

  // 수동 업데이트 실행
  async runUpdate() {
    if (this.isRunning) {
      console.log('DDNS update is already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('Starting DDNS update check...');

    try {
      let totalUpdated = 0;
      let totalErrors = 0;

      // 현재 공인 IP 조회
      const currentIP = await getCurrentIP();
      console.log(`Current IP: ${currentIP}`);

      // 자동 업데이트가 활성화된 A/CNAME 레코드 조회 (CNAME은 A 레코드로 자동 변환)
      const autoUpdateRecords = await dbAll(`
        SELECT dr.*, z.name as zone_name, ak.token
        FROM dns_records dr
        JOIN zones z ON dr.zone_id = z.id
        JOIN api_keys ak ON z.api_key_id = ak.id
        WHERE dr.auto_update = 1 AND dr.type IN ('A', 'CNAME')
      `);

      console.log(`Found ${autoUpdateRecords.length} auto-update records`);

      for (const record of autoUpdateRecords) {
        try {
          // CNAME 레코드인 경우 A 레코드로 변환 필요, A 레코드인 경우 IP만 비교
          const needsUpdate = record.type === 'CNAME' || record.content !== currentIP;
          
          if (!needsUpdate) {
            console.log(`Record ${record.name}.${record.zone_name} - No IP change needed`);
            continue;
          }

          const wasConverted = record.type === 'CNAME';
          console.log(`Updating record ${record.name}.${record.zone_name} from ${record.content} to ${currentIP}${wasConverted ? ' (CNAME → A conversion)' : ''}`);

          // Cloudflare API로 레코드 업데이트 (CNAME → A 변환 포함)
          const cloudflareAPI = new CloudflareAPI(record.token);
          
          // CNAME → A 변환 시 proxied는 false로 설정 (Cloudflare 제약사항)
          const shouldDisableProxy = record.type === 'CNAME' && record.proxied;
          
          await cloudflareAPI.updateDNSRecord(record.zone_id, record.id, {
            name: record.name,
            type: 'A', // CNAME이든 A든 모두 A 레코드로 설정
            content: currentIP,
            ttl: record.ttl,
            proxied: shouldDisableProxy ? false : record.proxied, // CNAME → A 변환 시 proxy 비활성화
          });

          // 로컬 DB 업데이트 (타입도 A로 변경, proxied 상태도 업데이트)
          const newProxied = shouldDisableProxy ? false : record.proxied;
          await dbRun(`
            UPDATE dns_records 
            SET type = 'A', content = ?, proxied = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
          `, [currentIP, newProxied, record.id]);

          // 상태 메시지 생성
          let statusMessage = wasConverted 
            ? `CNAME → A 레코드 변환 및 IP 업데이트 성공` 
            : 'IP 업데이트 성공';
          
          if (shouldDisableProxy) {
            statusMessage += ' (Proxy 비활성화됨)';
          }

          // 업데이트 로그 저장
          await dbRun(`
            INSERT INTO update_logs (record_id, old_ip, new_ip, status, message)
            VALUES (?, ?, ?, 'success', ?)
          `, [record.id, record.content, currentIP, statusMessage]);

          totalUpdated++;
          console.log(`✅ Successfully updated ${record.name}.${record.zone_name} - ${statusMessage}`);

        } catch (error) {
          console.error(`❌ Failed to update record ${record.name}.${record.zone_name}:`, error);

          // 에러 로그 저장
          await dbRun(`
            INSERT INTO update_logs (record_id, old_ip, new_ip, status, message)
            VALUES (?, ?, ?, 'error', ?)
          `, [record.id, record.content, currentIP, error instanceof Error ? error.message : 'Unknown error']);

          totalErrors++;
        }
      }

      console.log(`DDNS update completed - Updated: ${totalUpdated}, Errors: ${totalErrors}`);

    } catch (error) {
      console.error('DDNS update error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  // 현재 상태 확인
  isSchedulerRunning(): boolean {
    return this.intervalId !== null;
  }

  // 업데이트 진행 중인지 확인
  isUpdateInProgress(): boolean {
    return this.isRunning;
  }
}

// 싱글톤 인스턴스
export const ddnsScheduler = new DDNSScheduler();

// Next.js 서버 시작 시 자동으로 스케줄러 시작
if (typeof window === 'undefined') {
  const updateInterval = parseInt(process.env.UPDATE_INTERVAL || '5', 10);
  
  // 서버 시작 후 10초 후에 스케줄러 시작 (DB 초기화 대기)
  setTimeout(() => {
    console.log(`[Scheduler] Starting DDNS scheduler in ${process.env.NODE_ENV} mode with ${updateInterval} minute interval`);
    ddnsScheduler.start(updateInterval);
  }, 10000);
} 