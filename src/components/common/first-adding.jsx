'use strict';

var React = require('react');

require('./first-adding.less');


var FirstAdding = React.createClass({
    propTypes: {
        dataType: React.PropTypes.string.isRequired, // plural
        onAdding: React.PropTypes.func.isRequired
    },

    render: function() {
        return (
            <div className='first-adding'>
                <div>{ 'You don\'t have any ' + this.props.dataType + ' yet' }</div>
                <input
                    type='button'
                    value='+'
                    onClick={ this.props.onAdding }
                    />
            </div>
        );
    }
});


module.exports = FirstAdding;
