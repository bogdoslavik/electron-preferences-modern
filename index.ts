'use strict';

import {
    app,
    BrowserWindow,
    ipcMain,
    webContents,
    dialog,
    safeStorage,
    systemPreferences,
} from 'electron';
import path from 'path';
import url from 'url';
import fs from 'fs';
import _ from 'lodash';
import { EventEmitter2 } from 'eventemitter2';
import { loadJsonFileSync } from 'load-json-file';
import { writeJsonFile } from 'write-json-file';
import jsonSerializer from 'serialize-javascript'; // also serializes functions etc.
import { PreferencesOptions } from './types/preferences';

/* 1) handler to fetch OS accent color */
ipcMain.handle('get-accent-color', () => {
    return systemPreferences.getAccentColor(); // "aabbccdd"
});

/* 2) forward accent color changes (Windows only) */
if (process.platform === 'win32') {
    systemPreferences.on('accent-color-changed', (_e, newClr) => {
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('accent-color-changed', newClr); // "aabbccdd"
        });
    });
}

// Helper: collect "section.key" paths that changed
function diffPrefs(oldPrefs: any, newPrefs: any): string[] {
    const changed: string[] = [];

    const walk = (o: any, n: any, path: string[] = []) => {
        // Both values are objects → dive deeper
        if (_.isPlainObject(o) && _.isPlainObject(n)) {
            const keys = _.union(_.keys(o), _.keys(n));
            keys.forEach((k) => walk(o?.[k], n?.[k], [...path, k]));
        } else if (!_.isEqual(o, n)) {
            changed.push(path.join('.'));
        }
    };

    walk(oldPrefs, newPrefs);
    return changed;
}

class ElectronPreferences extends EventEmitter2 {
    /** map of instances by id */
    static instances: Map<string, ElectronPreferences> = new Map();

    prefsWindow?: BrowserWindow | null;
    _preferences: any;
    options: any;
    id?: string;

    private ipcChannel(name: string) {
        return this.id ? `${name}:${this.id}` : name;
    }

    constructor(options: PreferencesOptions = {}) {
        super();

        this.id = options.id;
        ElectronPreferences.instances.set(this.id ?? 'default', this);

        _.defaultsDeep(options, {
            config: {
                debounce: 150,
            },
            sections: [],
            webPreferences: {
                devTools: false,
            },
        });

        this.options = options;

        // Legacy: Set config values
        if (options.css && !options.config.css) {
            console.warn(
                'DEPRECATED: css option has been deprecated and will be removed in a future version. It now lives under config.css.',
            );
            this.options.config.css = options.css;
        }

        if (options.dataStore && !options.config.dataStore) {
            console.warn(
                'DEPRECATED: dataStore option has been deprecated and will be removed in a future version. It now lives under config.dataStore.',
            );
            this.options.config.dataStore = options.dataStore;
        }

        for (const [sectionIdx, section] of options.sections.entries()) {
            _.defaultsDeep(section, {
                form: {
                    groups: [],
                },
            });
            section.form.groups = section.form.groups.map((group, groupIdx) => {
                group.id = 'group' + sectionIdx + groupIdx;

                return group;
            });
        }

        if (!this.dataStore) {
            throw new Error("The 'dataStore' option is required.");
        }

        // Load preferences file if exists
        try {
            if (fs.existsSync(this.dataStore)) {
                this.preferences = loadJsonFileSync(this.dataStore);
            }
        } catch (error) {
            console.error(`Datastore error - ${error}`);
            this.preferences = null;
        }

        if (this.preferences) {
            // Set default preference values
            for (const prefDefault of _.keys(this.defaults)) {
                // PrefDefault is a group key

                if (prefDefault in this.preferences) {
                    // Merge preferences with defaults (in case new preference was added, set it's default)
                    this.preferences[prefDefault] = {
                        ...this.defaults[prefDefault],
                        ...this.preferences[prefDefault],
                    };
                } else {
                    // If group doesn't exist, copy all group defaults
                    this.preferences[prefDefault] = this.defaults[prefDefault];
                }
            }
        } else {
            this.preferences = this.defaults;
        }

        if (typeof options.onLoad === 'function') {
            this.preferences = options.onLoad(this.preferences);
        }

        this.save();

        ipcMain.on(this.ipcChannel('showPreferences'), (_, section) => {
            this.show(section);
        });

        ipcMain.on(this.ipcChannel('closePreferences'), (_) => {
            this.close();
        });

        ipcMain.on(this.ipcChannel('getConfig'), (event) => {
            event.returnValue = this.options.config;
        });

        ipcMain.on(this.ipcChannel('getSections'), (event) => {
            event.returnValue = jsonSerializer(this.options.sections);
        });

        ipcMain.on(this.ipcChannel('restoreDefaults'), (_) => {
            this.preferences = this.defaults;
            this.save();
            this.broadcast();
        });

        ipcMain.on(this.ipcChannel('getDefaults'), (event) => {
            event.returnValue = this.defaults;
        });

        ipcMain.on(this.ipcChannel('getPreferences'), (event) => {
            event.returnValue = this.preferences;
        });

        ipcMain.on(this.ipcChannel('setPreferences'), (event, value) => {
            const prevPrefs = _.cloneDeep(this.preferences);
            this.preferences = value;
            this.save();
            this.broadcast();
            const changed = diffPrefs(prevPrefs, this.preferences);
            this.emit(
                'save',
                Object.freeze(_.cloneDeep(this.preferences)),
                changed,
            );
            event.returnValue = null;
        });

        ipcMain.on(
            this.ipcChannel('showOpenDialog'),
            (event, dialogOptions) => {
                event.returnValue = dialog.showOpenDialogSync(dialogOptions);
            },
        );

        ipcMain.on(this.ipcChannel('sendButtonClick'), (_, message) => {
            // Main process
            this.emit('click', message);
        });

        ipcMain.on(this.ipcChannel('resetToDefaults'), (_) => {
            this.resetToDefaults();
        });

        ipcMain.on(this.ipcChannel('encrypt'), (event, secret) => {
            if (!safeStorage.isEncryptionAvailable()) {
                console.warn(
                    "Cannot encrypt secret as electron's safeStorage isn't available",
                );
                event.returnValue = '';
                return;
            }

            event.returnValue = safeStorage
                .encryptString(secret)
                .toString('base64');
        });

        ipcMain.on(this.ipcChannel('decrypt'), (event, encryptedSecret) => {
            if (!safeStorage.isEncryptionAvailable()) {
                console.warn(
                    "Cannot decrypt encrypted secret as electron's safeStorage isn't available",
                );
                event.returnValue = '';
                return;
            }

            const encryptedBuffer = Buffer.from(encryptedSecret, 'base64');
            event.returnValue = safeStorage.decryptString(encryptedBuffer);
        });

        if (typeof options.onLoad === 'function') {
            options.afterLoad(this);
        }
    }

    get dataStore() {
        return this.options.config.dataStore;
    }

    get browserWindowOverrides() {
        return this.options.browserWindowOverrides;
    }

    get config() {
        return this.options.config;
    }

    get defaults() {
        return _.cloneDeep(this.options.defaults || {});
    }

    get preferences() {
        return this._preferences;
    }

    set preferences(value) {
        this._preferences = value;
    }

    save() {
        writeJsonFile(this.dataStore, this.preferences, {
            indent: 4,
        });
    }

    value(key?: string, value?: any) {
        // Place the key/value pair(s) into this.preferences var
        if (_.isArray(key)) {
            key.forEach(({ key, value }) => {
                _.set(this.preferences, key, value);
            });
            this.save();
            this.broadcast();
        } else if (!_.isUndefined(key) && !_.isUndefined(value)) {
            _.set(this.preferences, key, value);
            this.save();
            this.broadcast();
        } else if (_.isUndefined(value)) {
            // Value is undefined
            return _.cloneDeep(_.get(this.preferences, key));
        } else {
            // Key is undefined
            return _.cloneDeep(this.preferences);
        }
    }

    broadcast() {
        for (const wc of webContents.getAllWebContents()) {
            wc.send(this.ipcChannel('preferencesUpdated'), this.preferences);
        }
    }

    getBrowserWindowOptions() {
        let browserWindowOptions = {
            title: 'Preferences',
            width: 800,
            maxWidth: 800,
            minWidth: 800,
            height: 600,
            minHeight: 600,
            resizable: true,
            acceptFirstMouse: true,
            maximizable: false,
            backgroundColor: '#E7E7E7',
            show: false,
            webPreferences: this.options.webPreferences,
        };

        const defaultWebPreferences = {
            nodeIntegration: false,
            enableRemoteModule: false,
            preload: path.join(__dirname, './preload.js'),
            devTools: this.options.debug,
        };

        const unOverridableWebPreferences = {
            contextIsolation: true,
            devTools: this.options.debug ? true : undefined,
        };

        // User provided `browserWindow`, we load those
        if (this.options.browserWindowOverrides) {
            browserWindowOptions = Object.assign(
                browserWindowOptions,
                this.options.browserWindowOverrides,
            );
        }

        // Object.assign is shallow, let's process browserWindow.webPreferences
        browserWindowOptions.webPreferences = Object.assign(
            defaultWebPreferences,
            browserWindowOptions.webPreferences,
            unOverridableWebPreferences,
        );

        if (this.id) {
            browserWindowOptions.webPreferences.additionalArguments = [
                ...(browserWindowOptions.webPreferences.additionalArguments ||
                    []),
                `--preferences-id=${this.id}`,
            ];
        }

        return browserWindowOptions;
    }

    show(section?) {
        if (typeof section !== 'undefined') {
            const sectionIds = this.options.sections.map(
                (section) => section.id,
            );
            if (!sectionIds.includes(section)) {
                console.warn(
                    `Could not find a section with id '${section}'. Ignoring the parameter`,
                );
                section = undefined;
            }
        }

        if (this.prefsWindow) {
            this.prefsWindow.focus();

            if (this.options.debug) {
                this.prefsWindow.webContents.openDevTools();
            }

            if (section) {
                this.prefsWindow.webContents.executeJavaScript(` \
              document.getElementById("tab-${section}").click() \
              ;0
            `); // ";0" is needed so nothing is returned (especially not an non-cloneable IPC object) by JS.
            }

            return this.prefsWindow;
        }

        this.prefsWindow = new BrowserWindow(this.getBrowserWindowOptions());

        if (this.options.menuBar) {
            this.prefsWindow.setMenu(this.options.menuBar);
        } else {
            this.prefsWindow.removeMenu();
        }

        this.prefsWindow.loadURL(
            url.format({
                pathname: path.join(__dirname, 'build/index.html'),
                protocol: 'file:',
                slashes: true,
            }),
        );

        this.prefsWindow.once('ready-to-show', () => {
            // Show: false by default, then show when ready to prevent page "flicker"
            this.prefsWindow.show();
        });

        this.prefsWindow.webContents.on('dom-ready', async () => {
            // Load custom css file
            const cssFile = this.config.css;
            if (cssFile) {
                const file = path
                    .join(app.getAppPath(), cssFile)
                    .replace(/\\/g, '/'); // Make sure it also works in Windows

                try {
                    if (await fs.promises.stat(file)) {
                        await this.prefsWindow.webContents.executeJavaScript(` \
					  		var f = document.createElement("link"); \
					  		f.rel = "stylesheet"; \
					  		f.type = "text/css"; \
					  		f.href = "${file}"; \
					  		document.getElementsByTagName("head")[0].appendChild(f) \
					  		;0
					  	`); // ";0" is needed so nothing is returned (especially not an non-cloneable IPC object) by JS.
                    }
                } catch (error) {
                    console.error(`Could not load css file ${file}: ${error}`);
                }
            }

            if (section) {
                try {
                    await this.prefsWindow.webContents.executeJavaScript(` \
					  		document.getElementById("tab-${section}").click() \
					  		;0
					  	`); // ";0" is needed so nothing is returned (especially not an non-cloneable IPC object) by JS.
                } catch (error) {
                    console.error(
                        `Could not open the requested section ${section}: ${error}`,
                    );
                }
            }
        });

        this.prefsWindow.on('closed', () => {
            this.prefsWindow = null;
        });

        if (this.options.debug) {
            this.prefsWindow.webContents.openDevTools();
        }

        return this.prefsWindow;
    }

    close() {
        if (!this.prefsWindow) {
            return;
        }

        this.prefsWindow.close();
    }

    resetToDefaults() {
        this._preferences = this.defaults;

        this.save();
        this.broadcast();
    }

    decrypt(encryptedSecretString) {
        if (!safeStorage.isEncryptionAvailable()) {
            throw new Error(
                "Cannot decrypt as electron's safeStorage isn't available yet",
            );
        }

        const encryptedSecret = Buffer.from(encryptedSecretString, 'base64');

        return safeStorage.decryptString(encryptedSecret);
    }
}

export default ElectronPreferences;
