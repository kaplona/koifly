'use strict';

var React = require('react');
var Label = require('./../section/label');
var Value = require('./../section/value');


var RowContent = React.createClass({

    propTypes: {
        label: React.PropTypes.string,
        value: React.PropTypes.string
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
