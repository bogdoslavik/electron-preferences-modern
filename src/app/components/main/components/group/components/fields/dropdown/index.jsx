'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Select, Label } from '@radix-ui/themes';

class DropdownField extends React.Component {

	render() {

		const options = this.options.map(option => (
			<Select.Item value={ option.value } key={ option.value }>
				{ option.label }
			</Select.Item>
		));

		return (
			<div className={`field field-dropdown key-${this.field.key}`}>
				<Label>{ this.label }</Label>
				<Select.Root value={ this.value } onValueChange={ value => this.onChange(value) }>
					<Select.Trigger />
					<Select.Content>
						<Select.Item value=''>-- Select One --</Select.Item>
						{ options }
					</Select.Content>
				</Select.Root>
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

DropdownField.propTypes = {
	field: PropTypes.object,
	value: PropTypes.string,
	onChange: PropTypes.func,
};

export default DropdownField;
