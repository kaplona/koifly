'use strict';

var React = require('react');
var Section = require('./section');
var PlainButton = require('./plain-button');


var SectionButton = React.createClass({

    propTypes: {
        text: React.PropTypes.string,
        type: React.PropTypes.string,
        buttonStyle: React.PropTypes.string,
        onClick: React.PropTypes.func,
        isEnabled: React.PropTypes.bool
    },

    render: function() {
        return (
            <Section>
                <PlainButton { ...this.props } />
            </Section>
        );
    }
});


module.exports = SectionButton;
