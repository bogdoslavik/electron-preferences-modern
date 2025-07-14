export interface PreferenceField {
    key?: string;
    label?: string;
    help?: string;
    inputType?: string;
    placeholder?: string;
    options?: Array<{ label: string; value: any }>;
    [key: string]: any;
}

declare global {
    const api: any;
}
