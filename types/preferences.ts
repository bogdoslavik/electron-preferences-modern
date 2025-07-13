import type {
    BrowserWindowConstructorOptions,
    Menu,
    WebPreferences,
} from 'electron';

/** Primitive a single preference can hold */
export type PrefValue =
    | string
    | number
    | boolean
    | null
    | PrefValue[]
    | { [key: string]: PrefValue };

/** Whole preferences object */
export type Preferences = Record<string, PrefValue>;

/** Options under `config` */
export interface PreferencesConfig {
    /** Path to the JSON file where prefs are stored (required) */
    dataStore: string;
    /** Extra CSS file injected into the preferences window */
    css?: string;
    /** Debounce delay (ms) before saving */
    debounce?: number;
}

export interface PreferencesGroup {
    /** Will be generated: "group01" … */
    id?: string;
    /** Any other props your form needs */
    [key: string]: unknown;
}

/** One UI section (simplified) */
export interface PreferencesSection {
    id: string;
    label?: string;
    form?: {
        groups: PreferencesGroup[]; // replace with a detailed type later
    };
}

/** Constructor argument for `ElectronPreferences` */
export interface PreferencesOptions {
    /** Core storage configuration */
    config?: PreferencesConfig;

    /** UI sections shown in the preferences window */
    sections?: PreferencesSection[];

    /** Extra webPreferences for the BrowserWindow */
    webPreferences?: WebPreferences;

    /** Additional BrowserWindow overrides (size, titleBarStyle, etc.) */
    browserWindowOverrides?: BrowserWindowConstructorOptions;

    /** Custom menu for the preferences window */
    menuBar?: Menu | null;

    /** Show DevTools for the preferences window */
    debug?: boolean;

    /** Deprecated fields kept for backward compatibility */
    css?: string;
    dataStore?: string;

    /** Hook called after prefs are loaded; may return modified prefs */
    onLoad?: (prefs: Preferences) => Preferences | void;

    /** Called after the component is fully initialised */
    afterLoad?: (instance: unknown /* ElectronPreferences */) => void;
}

