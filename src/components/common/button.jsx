'use strict';

var React = require('react');


var Button = React.createClass({
	
	propTypes: {
		type: React.PropTypes.string,
		onClick: React.PropTypes.func
	},
	
	getDefaultProps: function() {
		return {
			type: 'button'
		};
	},
	
	handleClick: function() {
		if (this.props.onClick) {
			this.props.onClick();
		};
		return;
	},
	
	render: function() {
		return (
			<input
				className='button'
				type={ this.props.type }
				value={ this.props.children }
				onClick={this.handleClick} />
		);
	}
});


module.exports = Button;