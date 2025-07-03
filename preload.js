'use strict';

const electron = require('electron');
const { contextBridge } = electron;
const { ipcRenderer } = electron;

// eslint-disable-next-line no-eval -- deserialize function for 'serialize-javascript' library
const deserializeJson = serializedJavascript => eval('(' + serializedJavascript + ')');
let onPreferencesUpdatedHandler;

contextBridge.exposeInMainWorld('api', {
	getSections: () => deserializeJson(ipcRenderer.sendSync('getSections')),
	getPreferences: () => ipcRenderer.sendSync('getPreferences'),
	getDefaults: () => ipcRenderer.sendSync('getDefaults'),
	getConfig: () => ipcRenderer.sendSync('getConfig'),
	setPreferences: preferences => ipcRenderer.send('setPreferences', preferences),
	showOpenDialog: dialogOptions => ipcRenderer.sendSync('showOpenDialog', dialogOptions),
	sendButtonClick: channel => ipcRenderer.send('sendButtonClick', channel),
	encrypt: secret => ipcRenderer.sendSync('encrypt', secret),
	onPreferencesUpdated(handler) {

		onPreferencesUpdatedHandler = handler;

	},
});
ipcRenderer.on('preferencesUpdated', (e, preferences) => {

	if (typeof onPreferencesUpdatedHandler === 'function') {

		onPreferencesUpdatedHandler(preferences);

	}

});

// Accent

async function fetchAccent() {
  const raw = await ipcRenderer.invoke('get-accent-color'); // "aabbccdd"
  return raw ? `#${raw.slice(0, 6)}` : '#0078d4';           // fallback Fluent blue
}

window.addEventListener('DOMContentLoaded', async () => {
  document.documentElement.style.setProperty('--accent', await fetchAccent());
});

ipcRenderer.on('accent-color-changed', (_e, newClr) => {
  document.documentElement.style.setProperty('--accent', `#${newClr.slice(0, 6)}`);
});

contextBridge.exposeInMainWorld('osAccent', {
  get: fetchAccent,
  onChange: handler =>
    ipcRenderer.on('accent-color-changed', (_e, clr) =>
      handler(`#${clr.slice(0, 6)}`))
});

function mix(hex, ratio/*0-1*/, white/*true=white,false=black*/) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const t = white ? 255 : 0;                 // target channel
  const m = c => Math.round(c * ratio + t * (1 - ratio));
  return `#${[m(r), m(g), m(b)].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}
