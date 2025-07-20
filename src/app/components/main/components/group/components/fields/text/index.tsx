'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { PreferenceField } from '../../../../../../../types';

interface ExtendedPreferenceField extends PreferenceField {
    /** How many visible lines the control should have; >1 => textarea */
    lines?: number;
}

interface TextFieldProps {
    field: ExtendedPreferenceField;
    value?: string;
    onChange: (value: string) => void;
}

class TextField extends React.Component<TextFieldProps> {
    /* ---------- helpers ---------- */
    private get field() {
        return this.props.field;
    }
    private get value() {
        return this.props.value ?? '';
    }
    private get label() {
        return this.field.label;
    }
    private get help() {
        return this.field.help;
    }
    private get lines() {
        return this.field.lines ?? 1;
    }
    private get placeholder() {
        const raw = this.field.placeholder;
        return typeof raw === 'function' ? (raw as () => string)() : raw;
    }
    private get inputType() {
        // still allow explicit inputType override
        return this.field.inputType ?? this.field.type ?? 'text';
    }

    /* ---------- event handler ---------- */
    private handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => this.props.onChange(e.target.value);

    /* ---------- render ---------- */
    public render() {
        const commonProps = {
            onChange: this.handleChange,
            value: this.value,
            placeholder: this.placeholder,
            'aria-label': this.label,
        };

        return (
            <div className={`field field-text key-${this.field.key}`}>
                <div className="field-label">{this.label}</div>

                {this.lines > 1 ? (
                    // multiline input
                    <textarea rows={this.lines} {...commonProps} />
                ) : (
                    // single-line input
                    <input type={this.inputType} {...commonProps} />
                )}

                {this.help && <span className="help">{this.help}</span>}
            </div>
        );
    }
}

TextField.propTypes = {
    field: PropTypes.object.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

export default TextField;
