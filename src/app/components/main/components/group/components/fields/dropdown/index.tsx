'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { PreferenceField } from '../../../../../../../types';

interface DropdownFieldProps {
    field: PreferenceField;
    value?: string;
    onChange: (value: string) => void;
}

class DropdownField extends React.Component<DropdownFieldProps> {
    render() {
        const options = this.options.map((option, idx) => (
            <option value={option.value} key={idx} aria-label={option.label}>
                {option.label}
            </option>
        ));

        return (
            <div className={`field field-dropdown key-${this.field.key}`}>
                <div className="field-label">{this.label}</div>
                <select
                    onChange={this.onChange.bind(this)}
                    value={this.value}
                    aria-label={this.label}
                >
                    {options}
                </select>
                {this.help && <span className="help">{this.help}</span>}
            </div>
        );
    }

    get field() {
        return this.props.field;
    }

    get value() {
        return this.props.value || '';
    }

    get label() {
        return this.field.label;
    }

    get options() {
        const opts = this.field.options;

        if (typeof opts === 'function') {
            const result = (opts as () => any[])();
            return Array.isArray(result) ? result : [];
        }

        return Array.isArray(opts) ? opts : [];
    }

    get help() {
        return this.field.help;
    }

    onChange(e) {
        return this.props.onChange(e.target.value);
    }
}

DropdownField.propTypes = {
    field: PropTypes.object,
    value: PropTypes.string,
    onChange: PropTypes.func,
};

export default DropdownField;
