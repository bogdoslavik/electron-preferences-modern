'use strict';

const electron = require('electron');
const { contextBridge } = electron;
const { ipcRenderer } = electron;

function channel(prefix, name) {
    return prefix ? `${prefix}:${name}` : name;
}

// eslint-disable-next-line no-eval -- deserialize function for 'serialize-javascript' library
const deserializeJson = (serializedJavascript) =>
    eval('(' + serializedJavascript + ')');
contextBridge.exposeInMainWorld('prefAPI', (prefix = '') => ({
    get: () => ipcRenderer.invoke(channel(prefix, 'getPreferences')),
    save: (data) => ipcRenderer.send(channel(prefix, 'savePreferences'), data),
    onUpdated: (cb) =>
        ipcRenderer.on(channel(prefix, 'preferencesUpdated'), cb),
}));

// Accent
function lightenWithWhite(hex, whitePart = 0.35) {
    const k = 1 - whitePart;
    const rgb = [1, 3, 5].map((i) => parseInt(hex.substr(i, 2), 16));
    const lr = rgb.map((c) =>
        Math.round(c * k + 255 * whitePart)
            .toString(16)
            .padStart(2, '0'),
    );
    return `#${lr.join('')}`; // lightened shade of the Windows accent
}

// Export for testing purposes
module.exports.lightenWithWhite = lightenWithWhite;

/* ----------------------------------------------------------
 * store the result in the --accent CSS variable
 * ---------------------------------------------------------*/
async function setAccentTint(rawHex) {
    const base = `#${(rawHex || '0078d4').slice(0, 6)}`;
    const tint = lightenWithWhite(base, 0.2);
    document.documentElement.style.setProperty('--accent', tint);
    return tint;
}

/* Initial run */
window.addEventListener('DOMContentLoaded', async () =>
    setAccentTint(await ipcRenderer.invoke('get-accent-color')),
);

/* Live accent color updates (Windows) */
ipcRenderer.on('accent-color-changed', (_e, clr) => setAccentTint(clr));

/* Expose accent utilities to React if needed */
contextBridge.exposeInMainWorld('osAccent', {
    get: async () =>
        setAccentTint(await ipcRenderer.invoke('get-accent-color')),
    onChange: (h) =>
        ipcRenderer.on('accent-color-changed', async (_e, clr) =>
            h(await setAccentTint(clr)),
        ),
});
