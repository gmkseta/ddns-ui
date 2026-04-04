import { describe, it, expect } from 'vitest';
import { sortRecords, toggleSortDirection, updateSortState } from '@/utils/sort';
import type { DNSRecord } from '@/utils/api';

const mockRecords: DNSRecord[] = [
  { id: '1', name: 'alpha.example.com', type: 'A', content: '1.2.3.4', ttl: 120, proxied: false, autoUpdate: true },
  { id: '2', name: 'beta.example.com', type: 'CNAME', content: 'target.com', ttl: 3600, proxied: true, autoUpdate: false },
  { id: '3', name: 'gamma.example.com', type: 'A', content: '5.6.7.8', ttl: 300, proxied: false, autoUpdate: true },
];

describe('sortRecords', () => {
  it('sorts by name ascending', () => {
    const sorted = sortRecords(mockRecords, 'name', 'asc');
    expect(sorted[0].name).toBe('alpha.example.com');
    expect(sorted[2].name).toBe('gamma.example.com');
  });

  it('sorts by name descending', () => {
    const sorted = sortRecords(mockRecords, 'name', 'desc');
    expect(sorted[0].name).toBe('gamma.example.com');
    expect(sorted[2].name).toBe('alpha.example.com');
  });

  it('sorts by type', () => {
    const sorted = sortRecords(mockRecords, 'type', 'asc');
    expect(sorted[0].type).toBe('A');
    expect(sorted[2].type).toBe('CNAME');
  });

  it('sorts by content', () => {
    const sorted = sortRecords(mockRecords, 'content', 'asc');
    expect(sorted[0].content).toBe('1.2.3.4');
  });

  it('sorts by ttl', () => {
    const sorted = sortRecords(mockRecords, 'ttl', 'asc');
    expect(sorted[0].ttl).toBe(120);
    expect(sorted[2].ttl).toBe(3600);
  });

  it('sorts by autoUpdate', () => {
    const sorted = sortRecords(mockRecords, 'autoUpdate', 'desc');
    expect(sorted[0].autoUpdate).toBe(true);
    expect(sorted[2].autoUpdate).toBe(false);
  });

  it('sorts by synced status with current IP', () => {
    const sorted = sortRecords(mockRecords, 'synced', 'desc', '1.2.3.4');
    expect(sorted[0].content).toBe('1.2.3.4');
  });

  it('does not mutate original array', () => {
    const original = [...mockRecords];
    sortRecords(mockRecords, 'name', 'desc');
    expect(mockRecords).toEqual(original);
  });
});

describe('toggleSortDirection', () => {
  it('toggles asc to desc', () => {
    expect(toggleSortDirection('asc')).toBe('desc');
  });

  it('toggles desc to asc', () => {
    expect(toggleSortDirection('desc')).toBe('asc');
  });
});

describe('updateSortState', () => {
  it('toggles direction when same field clicked', () => {
    const result = updateSortState('name', 'name', 'asc');
    expect(result.sortBy).toBe('name');
    expect(result.sortDirection).toBe('desc');
  });

  it('resets to asc when different field clicked', () => {
    const result = updateSortState('type', 'name', 'desc');
    expect(result.sortBy).toBe('type');
    expect(result.sortDirection).toBe('asc');
  });
});
