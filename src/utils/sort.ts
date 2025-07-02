import { DNSRecord } from './api';

export type SortField = 'name' | 'type' | 'content' | 'ttl' | 'autoUpdate' | 'synced';
export type SortDirection = 'asc' | 'desc';

/**
 * DNS 레코드를 정렬하는 함수
 */
export const sortRecords = (
  records: DNSRecord[],
  sortBy: SortField,
  sortDirection: SortDirection,
  currentIP?: string | null
): DNSRecord[] => {
  return [...records].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'content':
        aValue = a.content;
        bValue = b.content;
        break;
      case 'ttl':
        aValue = a.ttl;
        bValue = b.ttl;
        break;
      case 'autoUpdate':
        aValue = a.autoUpdate ? 1 : 0;
        bValue = b.autoUpdate ? 1 : 0;
        break;
      case 'synced':
        // 현재 IP와 레코드 IP가 같은지 확인 (A 레코드만)
        aValue = (currentIP && a.type === 'A' && a.content === currentIP) ? 1 : 0;
        bValue = (currentIP && b.type === 'A' && b.content === currentIP) ? 1 : 0;
        break;
      default:
        return 0;
    }

    let comparison = 0;
    if (aValue > bValue) {
      comparison = 1;
    } else if (aValue < bValue) {
      comparison = -1;
    }

    return sortDirection === 'desc' ? comparison * -1 : comparison;
  });
};

/**
 * 정렬 방향을 토글하는 함수
 */
export const toggleSortDirection = (currentDirection: SortDirection): SortDirection => {
  return currentDirection === 'asc' ? 'desc' : 'asc';
};

/**
 * 정렬 상태를 업데이트하는 함수
 */
export const updateSortState = (
  field: SortField,
  currentSortBy: SortField,
  currentDirection: SortDirection
): { sortBy: SortField; sortDirection: SortDirection } => {
  if (field === currentSortBy) {
    return {
      sortBy: field,
      sortDirection: toggleSortDirection(currentDirection),
    };
  } else {
    return {
      sortBy: field,
      sortDirection: 'asc',
    };
  }
}; 