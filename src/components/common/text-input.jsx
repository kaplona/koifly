'use strict';

var React = require('react');


var TextInput = React.createClass({
	
	propTypes: {
		inputValue: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number
		]),
		labelText: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.element
		]),
		errorMessage: React.PropTypes.string,
		onChange: React.PropTypes.func,
		onBlur: React.PropTypes.func
	},
	
	handleUserInput: function() {
		this.props.onChange(this.refs.input.getDOMNode().value);
	},
	
	render: function() {
		return (
			<div>
				<div className='error_message'>
					{ this.props.errorMessage }
				</div>
				<label>{ this.props.labelText }</label>
				<input
					value={ this.props.inputValue }
					type='text'
					className={ this.props.errorMessage !== '' ? 'error' : '' }
					onChange={ this.handleUserInput }
					onBlur={ this.props.onBlur }
					ref='input' />
			</div>
		);
	}
});


module.exports = TextInput;



