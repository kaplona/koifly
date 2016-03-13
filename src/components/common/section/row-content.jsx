'use strict';

var React = require('react');
var Label = require('./label');
var ValueContainer = require('./value-container');


var RowContent = React.createClass({

    propTypes: {
        label: React.PropTypes.string,
        value: React.PropTypes.oneOfType([
            React.PropTypes.element,
            React.PropTypes.string,
            React.PropTypes.number
        ])
    },

    render: function() {
        return (
            <div>
                <Label>{ this.props.label }</Label>
                <ValueContainer>{ this.props.value }</ValueContainer>
            </div>
        );
    }

});


module.exports = RowContent;
