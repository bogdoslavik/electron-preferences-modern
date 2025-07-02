'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox as RadixCheckbox, Label } from '@radix-ui/themes';
import { newGuid } from '../../../../../../../utils/newGuid.js';

class CheckboxField extends React.Component {

	render() {

		let { value } = this;
		const { help, label } = this;

		const fieldID = `checkbox_${newGuid()}`;

		const options = this.options.map((option, idx) => {

			// If only a single checkbox is being rendered, this allows you the ability to pass
			// a boolean default value instead of ['value'], for convenience.
			if (typeof value === 'boolean' && this.options.length === 1) {

				value = value ? [ option.value ] : [];

			} else if (typeof value !== 'object') {

				value = [];

			}

			const id = `${fieldID}_${idx}`;
			const checked = value.includes(option.value);

			return (
				<label htmlFor={ id } className='checkbox-option' key={idx}>
					<RadixCheckbox id={ id } checked={ checked } onCheckedChange={ checked => this.onOptionChange(option.value, checked) } />
					{ option.label }
				</label>
			);

		});

		return (
			<div className={`field field-checkbox key-${this.field.key}`}>
				<Label>{ label }</Label>
				{ options }
				{ help && <span className='help'>{ help }</span> }
			</div>
		);

	}

	get field() {

		return this.props.field;

	}

	get value() {

		return this.props.value || [];

	}

	get label() {

		return this.field.label;

	}

	get options() {

		return this.field.options || [];

	}

	get help() {

		return this.field.help;

	}

	onOptionChange(optionValue, checked) {

		let { value } = this;
		const option = optionValue;

		// Coerce values
		if (typeof value === 'boolean' && this.options.length === 1) {

			value = value ? [ option ] : [];

		} else if (typeof value !== 'object') {

			value = [];

		}

		if (checked) {

			if (!value.includes(option)) {

				value.push(option);

			}

		} else {

			const valueIdx = value.indexOf(option);
			if (valueIdx > -1) {

				value.splice(valueIdx, 1);

			}

		}

		return this.props.onChange(value);

	}

}

CheckboxField.propTypes = {
	field: PropTypes.object,
	value: PropTypes.array,
	onChange: PropTypes.func,
};

export default CheckboxField;
