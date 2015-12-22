'use strict';

var React = require('react');
var Button = require('./button');


var Notice = React.createClass({
    propTypes: {
        text: React.PropTypes.string,
        onClick: React.PropTypes.func,
        buttonText: React.PropTypes.string
    },

    renderButton: function() {
        if (this.props.onClick) {
            return (
                <Button onClick={ this.props.onClick }>
                    { this.props.buttonText }
                </Button>
            );
        }
    },

    render: function() {
        return (
            <div className='notice'>
                { this.props.text }
                { this.renderButton() }
            </div>
        );
    }
});

module.exports = Notice;
