import { describe, it, expect, vi, beforeEach } from 'vitest';
import ElectronPreferences from '../index';
import { ipcMain, webContents } from 'electron';
import { writeJsonFile } from 'write-json-file';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('ipcPrefix option', () => {
    it('isolates IPC channels per instance', () => {
        const core = new ElectronPreferences({
            config: { dataStore: 'core.json' },
            ipcPrefix: 'core',
        });
        const plugin = new ElectronPreferences({
            config: { dataStore: 'plugin.json' },
            ipcPrefix: 'plugin',
        });

        expect(ipcMain.on).toHaveBeenCalledWith(
            'core:showPreferences',
            expect.any(Function),
        );
        expect(ipcMain.on).toHaveBeenCalledWith(
            'plugin:showPreferences',
            expect.any(Function),
        );

        expect(writeJsonFile).toHaveBeenCalledWith(
            'core.json',
            expect.anything(),
            { indent: 4 },
        );
        expect(writeJsonFile).toHaveBeenCalledWith(
            'plugin.json',
            expect.anything(),
            { indent: 4 },
        );

        // ensure broadcast uses prefix
        const wc1 = { send: vi.fn() } as any;
        const wc2 = { send: vi.fn() } as any;
        (webContents.getAllWebContents as any).mockReturnValue([wc1]);
        core.broadcast();
        expect(wc1.send).toHaveBeenCalledWith(
            'core:preferencesUpdated',
            expect.anything(),
        );

        (webContents.getAllWebContents as any).mockReturnValue([wc2]);
        plugin.broadcast();
        expect(wc2.send).toHaveBeenCalledWith(
            'plugin:preferencesUpdated',
            expect.anything(),
        );
    });
});
