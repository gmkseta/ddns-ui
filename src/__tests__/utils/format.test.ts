import { describe, it, expect } from 'vitest';
import { formatCount, formatTTL, getRecordTypeColor, formatErrorMessage, formatBytes } from '@/utils/format';

describe('formatCount', () => {
  it('returns singular form for count of 1', () => {
    expect(formatCount(1, 'record')).toBe('1 record');
  });

  it('returns plural form for count > 1', () => {
    expect(formatCount(5, 'record')).toBe('5 records');
  });

  it('returns plural form for count of 0', () => {
    expect(formatCount(0, 'record')).toBe('0 records');
  });

  it('uses custom plural form when provided', () => {
    expect(formatCount(3, 'entry', 'entries')).toBe('3 entries');
  });
});

describe('formatTTL', () => {
  it('formats seconds', () => {
    expect(formatTTL(30)).toBe('30초');
  });

  it('formats minutes', () => {
    expect(formatTTL(120)).toBe('2분');
    expect(formatTTL(300)).toBe('5분');
  });

  it('formats hours', () => {
    expect(formatTTL(3600)).toBe('1시간');
    expect(formatTTL(7200)).toBe('2시간');
  });

  it('formats days', () => {
    expect(formatTTL(86400)).toBe('1일');
    expect(formatTTL(172800)).toBe('2일');
  });

  it('floors partial values', () => {
    expect(formatTTL(90)).toBe('1분');
    expect(formatTTL(5400)).toBe('1시간');
  });
});

describe('getRecordTypeColor', () => {
  it('returns correct color for A record', () => {
    expect(getRecordTypeColor('A')).toContain('blue');
  });

  it('returns correct color for AAAA record', () => {
    expect(getRecordTypeColor('AAAA')).toContain('purple');
  });

  it('returns correct color for CNAME record', () => {
    expect(getRecordTypeColor('CNAME')).toContain('green');
  });

  it('returns correct color for MX record', () => {
    expect(getRecordTypeColor('MX')).toContain('orange');
  });

  it('returns correct color for TXT record', () => {
    expect(getRecordTypeColor('TXT')).toContain('gray');
  });

  it('returns default color for unknown type', () => {
    expect(getRecordTypeColor('SRV')).toContain('gray');
  });

  it('is case-insensitive', () => {
    expect(getRecordTypeColor('a')).toContain('blue');
    expect(getRecordTypeColor('cname')).toContain('green');
  });
});

describe('formatErrorMessage', () => {
  it('returns error message for Error instances', () => {
    expect(formatErrorMessage(new Error('test error'))).toBe('test error');
  });

  it('returns string errors directly', () => {
    expect(formatErrorMessage('string error')).toBe('string error');
  });

  it('returns default message for unknown types', () => {
    expect(formatErrorMessage(42)).toBe('알 수 없는 오류가 발생했습니다.');
    expect(formatErrorMessage(null)).toBe('알 수 없는 오류가 발생했습니다.');
    expect(formatErrorMessage(undefined)).toBe('알 수 없는 오류가 발생했습니다.');
  });
});

describe('formatBytes', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500 Bytes');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1048576)).toBe('1 MB');
  });

  it('formats gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1 GB');
  });
});
