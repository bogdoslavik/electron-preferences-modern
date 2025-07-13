import type { EventEmitter } from 'events';
import type {
    Preferences,
    PreferencesOptions,
} from 'electron-preferences-modern/dist/types/preferences';

/** экземпляр, который возвращает new ElectronPreferences(...) */
export interface ElectronPreferencesInstance
    extends EventEmitter {
    /** текущие prefs */
    preferences: Preferences;

    on(event: 'save', listener: (prefs: Preferences) => void): this;
    on(event: 'click', listener: (key: string) => void): this;
}

export interface ElectronPreferencesConstructor {
    new (options: PreferencesOptions): ElectronPreferencesInstance;
}

declare const ElectronPreferences: ElectronPreferencesConstructor;
export = ElectronPreferences;
// export default ElectronPreferences;
