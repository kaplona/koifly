'use strict';

var React = require('react');
var Label = require('./label');
var Value = require('./value-container');


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
                <Value>{ this.props.value }</Value>
            </div>
        );
    }

});


module.exports = RowContent;
