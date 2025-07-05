import { describe, it, expect, vi, beforeEach } from 'vitest';


import ElectronPreferences from '../index';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ElectronPreferences', () => {
  it('throws without dataStore option', () => {
    expect(() => new ElectronPreferences()).toThrow("dataStore");
  });

  it('returns merged browser window options', () => {
    const ep = new ElectronPreferences({
      config: { dataStore: 'prefs.json' },
      debug: true,
      browserWindowOverrides: {
        width: 1024,
        webPreferences: { custom: true, nodeIntegration: true },
      },
    });
    const opts = ep.getBrowserWindowOptions();
    expect(opts.width).toBe(1024);
    expect(opts.webPreferences.custom).toBe(true);
    expect(opts.webPreferences.nodeIntegration).toBe(true);
    expect(opts.webPreferences.contextIsolation).toBe(true);
    expect(opts.webPreferences.devTools).toBe(true);
  });

  it('decrypts encoded strings using safeStorage', () => {
    const ep = new ElectronPreferences({ config: { dataStore: 'prefs.json' } });
    const secret = Buffer.from('hello').toString('base64');
    const result = ep.decrypt(secret);
    expect(result).toBe('hello');
  });
});
