export interface PreferenceField {
    key?: string;
    label?: string;
    help?: string;
    inputType?: string;
    placeholder?: string;
    lines?: number; // for text field
    options?: Array<{ label: string; value: any }>;
    [key: string]: any;
}

declare global {
    const api: any;
}
