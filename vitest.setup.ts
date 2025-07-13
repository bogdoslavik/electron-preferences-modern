import { vi } from 'vitest';

vi.mock('electron', () => {
    return {
        app: { getAppPath: vi.fn(() => '/app') },
        BrowserWindow: vi.fn(() => ({
            webContents: {
                on: vi.fn(),
                once: vi.fn(),
                executeJavaScript: vi.fn(),
                openDevTools: vi.fn(),
            },
            loadURL: vi.fn(),
            setMenu: vi.fn(),
            removeMenu: vi.fn(),
            show: vi.fn(),
            focus: vi.fn(),
            close: vi.fn(),
        })),
        ipcMain: { on: vi.fn(), handle: vi.fn() },
        webContents: { getAllWebContents: vi.fn(() => []) },
        dialog: { showOpenDialogSync: vi.fn() },
        safeStorage: {
            isEncryptionAvailable: vi.fn(() => true),
            decryptString: vi.fn((buf) => buf.toString('utf8')),
            encryptString: vi.fn((str) => Buffer.from(str)),
        },
        systemPreferences: { on: vi.fn(), getAccentColor: vi.fn() },
        contextBridge: { exposeInMainWorld: vi.fn() },
        ipcRenderer: { on: vi.fn(), sendSync: vi.fn(), invoke: vi.fn() },
    };
});

vi.mock('fs', () => {
    const existsSync = vi.fn(() => false);
    const promises = { stat: vi.fn() };
    return {
        default: { existsSync, promises },
        existsSync,
        promises,
    };
});

vi.mock('load-json-file', () => ({ loadJsonFileSync: vi.fn() }));
vi.mock('write-json-file', () => ({ writeJsonFile: vi.fn() }));
