// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getFromStorage,
  setToStorage,
  removeFromStorage,
  getSelectedApiKey,
  setSelectedApiKey,
  getSelectedZone,
  setSelectedZone,
} from '@/utils/storage';

describe('storage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getFromStorage', () => {
    it('returns null for non-existent key', () => {
      expect(getFromStorage('nonexistent')).toBeNull();
    });

    it('returns stored value', () => {
      localStorage.setItem('test-key', 'test-value');
      expect(getFromStorage('test-key')).toBe('test-value');
    });
  });

  describe('setToStorage', () => {
    it('stores a value', () => {
      setToStorage('test-key', 'test-value');
      expect(localStorage.getItem('test-key')).toBe('test-value');
    });
  });

  describe('removeFromStorage', () => {
    it('removes a stored value', () => {
      localStorage.setItem('test-key', 'test-value');
      removeFromStorage('test-key');
      expect(localStorage.getItem('test-key')).toBeNull();
    });
  });

  describe('getSelectedApiKey / setSelectedApiKey', () => {
    it('returns null when no key is set', () => {
      expect(getSelectedApiKey()).toBeNull();
    });

    it('stores and retrieves API key', () => {
      setSelectedApiKey('key-123');
      expect(getSelectedApiKey()).toBe('key-123');
    });
  });

  describe('getSelectedZone / setSelectedZone', () => {
    it('returns null when no zone is set', () => {
      expect(getSelectedZone()).toBeNull();
    });

    it('stores and retrieves zone', () => {
      setSelectedZone('zone-abc');
      expect(getSelectedZone()).toBe('zone-abc');
    });
  });
});
