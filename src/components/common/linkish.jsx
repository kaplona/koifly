'use strict';

var React = require('react');

require('./linkish.less');


var Linkish = React.createClass({

    propTypes: {
        onClick: React.PropTypes.func
    },

    handleClick: function() {
        if (this.props.onClick) {
            this.props.onClick();
        }
    },

    render: function() {
        return (
            <div className='linkish' onClick={ this.handleClick }>
                { this.props.children }
            </div>
        );
    }
});


module.exports = Linkish;
