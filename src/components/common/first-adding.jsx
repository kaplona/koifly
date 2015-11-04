'use strict';

var React = require('react');
var Button = require('./button');


var FirstAdding = React.createClass({
    propTypes: {
        dataType: React.PropTypes.string, // plural
        onAdding: React.PropTypes.func
    },

    handleAdding: function() {
        this.props.onAdding();
    },

    render: function() {
        return (
            <div className='center'>
                <div>{ 'You don\'t have any ' + this.props.dataType + ' yet' }</div>
                <Button onClick={ this.handleAdding }>Add</Button>
            </div>
        );
    }
});


module.exports = FirstAdding;
