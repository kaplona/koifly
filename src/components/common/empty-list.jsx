'use strict';

var React = require('react');

require('./empty-list.less');


var EmptyList = React.createClass({
    propTypes: {
        ofWhichItems: React.PropTypes.string.isRequired, // plural
        onAdding: React.PropTypes.func.isRequired
    },

    render: function() {
        return (
            <div className='empty-list'>
                <div>{ 'You don\'t have any ' + this.props.ofWhichItems + ' yet' }</div>
                <div className='add-button' onClick={ this.props.onAdding }>+</div>
            </div>
        );
    }
});


module.exports = EmptyList;
