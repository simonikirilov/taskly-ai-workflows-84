// Centralized localStorage utilities for Taskly v1

const PREFIX = 'taskly.v1';

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(`${PREFIX}.${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key: string, value: any): void {
    try {
      localStorage.setItem(`${PREFIX}.${key}`, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent('taskly:changed', { detail: { key, value } }));
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  patch(key: string, updates: any): void {
    const current = this.get(key, {});
    this.set(key, { ...current, ...updates });
  },

  clear(pattern?: string): void {
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.startsWith(PREFIX)) {
        if (!pattern || k.includes(pattern)) {
          localStorage.removeItem(k);
        }
      }
    });
    window.dispatchEvent(new CustomEvent('taskly:changed', { detail: { cleared: pattern || 'all' } }));
  },

  exportAll(): Record<string, any> {
    const data: Record<string, any> = { version: '1.0.0', exported: new Date().toISOString() };
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.startsWith(PREFIX)) {
        try {
          data[k.replace(`${PREFIX}.`, '')] = JSON.parse(localStorage.getItem(k) || '{}');
        } catch {
          data[k.replace(`${PREFIX}.`, '')] = localStorage.getItem(k);
        }
      }
    });
    return data;
  }
};
