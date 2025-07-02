'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { TextField as RadixTextField, Label } from '@radix-ui/themes';

class TextField extends React.Component {

	render() {

		return (
			<div className={`field field-text key-${this.field.key}`}>
				<Label>{ this.label }</Label>
				<RadixTextField.Root>
					<RadixTextField.Input type={ this.inputType } onChange={ this.onChange.bind(this) } value={ this.value } aria-label={ this.label } />
				</RadixTextField.Root>
				{ this.help && <span className='help'>{ this.help }</span> }
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

	get inputType() {

		return this.field.inputType || this.field.type || 'text';

	}

	get help() {

		return this.field.help;

	}

	onChange(e) {

		return this.props.onChange(e.target.value);

	}

}

TextField.propTypes = {
	field: PropTypes.object,
	value: PropTypes.string,
	onChange: PropTypes.func,
};

export default TextField;
