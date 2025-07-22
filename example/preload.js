'use strict';

const electron = require('electron');

const { contextBridge } = electron;
const { ipcRenderer } = electron;
const ch = (name, id) => (id ? `${name}:${id}` : name);

let onPreferencesChangedHandler = () => {};

contextBridge.exposeInMainWorld('api', {
    showPreferences: (section, id) =>
        ipcRenderer.send(ch('showPreferences', id), section),
    closePreferences: (id) => ipcRenderer.send(ch('closePreferences', id)),
    getPreferences: (id) => ipcRenderer.sendSync(ch('getPreferences', id)),
    onPreferencesChanged(handler) {
        onPreferencesChangedHandler = handler;
    },
    getDefaults: (id) => ipcRenderer.sendSync(ch('getDefaults', id)),
    resetToDefaults: (id) => ipcRenderer.send(ch('resetToDefaults', id)),
    decrypt: (encryptedSecret, id) =>
        ipcRenderer.sendSync(ch('decrypt', id), encryptedSecret),
});

ipcRenderer.on(ch('preferencesUpdated'), (e, preferences) => {
    onPreferencesChangedHandler(preferences);
});

console.log('Preloaded');
