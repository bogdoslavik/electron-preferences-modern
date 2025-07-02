'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { RadioGroup, Label } from '@radix-ui/themes';

class RadioField extends React.Component {

	render() {

		const options = this.options.map(option => (
			<RadioGroup.Item value={ option.value } key={ option.value }>
				{ option.label }
			</RadioGroup.Item>
		));

		return (
			<div className={`field field-radio key-${this.field.key}`}>
				<Label>{ this.label }</Label>
				<RadioGroup.Root value={ this.value } onValueChange={ value => this.onChange(value) }>
					{ options }
				</RadioGroup.Root>
				{ this.help && <span className='help'>{ this.help }</span> }
			</div>
		);

	}

	get field() {

		return this.props.field;

	}

	get value() {

		return this.props.value || false;

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

	onChange(value) {

		return this.props.onChange(value);

	}

}

RadioField.propTypes = {
	field: PropTypes.object,
	value: PropTypes.string,
	onChange: PropTypes.func,
};

export default RadioField;
