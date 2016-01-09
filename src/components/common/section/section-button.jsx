'use strict';

var React = require('react');
var Section = require('./section');

require('./section-button.less');


var SectionButton = React.createClass({

    propTypes: {
        text: React.PropTypes.string,
        type: React.PropTypes.string,
        buttonStyle: React.PropTypes.string,
        onClick: React.PropTypes.func,
        isEnabled: React.PropTypes.bool
    },

    getDefaultProps: function() {
        return {
            type: 'button',
            isEnabled: true
        };
    },

    handleClick: function(event) {
        if (this.props.onClick && this.props.isEnabled) {
            this.props.onClick(event);
        }
    },

    render: function() {
        var className = 'section-button';
        if (this.props.buttonStyle) {
            className += ' x-' + this.props.buttonStyle;
        }

        return (
            <Section>
                <input
                    className={ className }
                    type={ this.props.type }
                    disabled={ !this.props.isEnabled ? 'disabled' : '' }
                    value={ this.props.text.toUpperCase() }
                    onClick={ this.handleClick }
                    />
            </Section>
        );
    }
});


module.exports = SectionButton;
