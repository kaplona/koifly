'use strict';

var React = require('react');


var RemarksInput = React.createClass({
	
	propTypes: {
		inputValue: React.PropTypes.string,
		labelText: React.PropTypes.string,
		onChange: React.PropTypes.func
	},
	
	handleUserInput: function() {
		this.props.onChange(this.refs.textarea.getDOMNode().value);
	},
	
	render: function() {
		return (
			<div>
				<label>{ this.props.labelText }</label>
				<textarea
					value={ this.props.inputValue }
					onChange={ this.handleUserInput }
					ref='textarea' />
			</div>
		);
	}
});


module.exports = RemarksInput;



