'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { PreferenceField } from '../../../../../../../types';

interface TextFieldProps {
    field: PreferenceField;
    value?: string;
    onChange: (value: string) => void;
}
class TextField extends React.Component<TextFieldProps> {
    render() {
        return (
            <div className={`field field-text key-${this.field.key}`}>
                <div className="field-label">{this.label}</div>
                <input
                    type={this.inputType}
                    onChange={this.handleChange}
                    value={this.value}
                    placeholder={this.placeholder}
                    aria-label={this.label}
                />
                {this.help && <span className="help">{this.help}</span>}
            </div>
        );
    }

    get field()        { return this.props.field; }
    get value()        { return this.props.value ?? ''; }
    get label()        { return this.field.label; }
    get inputType()    { return this.field.inputType ?? this.field.type ?? 'text'; }
    get help()         { return this.field.help; }
    get placeholder()  { return this.field.placeholder ?? ''; }
    handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        this.props.onChange(e.target.value);
}

TextField.propTypes = {
    field: PropTypes.object,
    value: PropTypes.string,
    onChange: PropTypes.func,
};

export default TextField;
