'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Slider as RadixSlider, Label } from '@radix-ui/themes';

class SliderField extends React.Component {

	render() {

		return (
			<div className={`field field-slider key-${this.field.key}`}>
				<Label>{ this.label }</Label>
				<RadixSlider
					value={[ this.value ]}
					onValueChange={([ val ]) => this.onChange({ target: { value: val } })}
					min={ this.min }
					max={ this.max }
					step={ this.step }
				/>
				<label>{ this.value }</label>
				{ this.help && <span className='help'>{ this.help }</span> }
			</div>
		);

	}

	get field() {

		return this.props.field;

	}

	get value() {

		return this.props.value || this.min;

	}

	get label() {

		return this.field.label;

	}

	get min() {

		return this.field.min || 0;

	}

	get max() {

		return this.field.max || 100;

	}

	get step() {

		return this.field.step || 1;

	}

	get help() {

		return this.field.help;

	}

	onChange(e) {

		return this.props.onChange(Number.parseInt(e.target.value, 10));

	}

}

SliderField.propTypes = {
	field: PropTypes.object,
	value: PropTypes.number,
	onChange: PropTypes.func,
};

export default SliderField;
