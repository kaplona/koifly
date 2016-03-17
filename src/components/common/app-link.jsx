'use strict';

var React = require('react');

require('./app-link.less');


var AppLink = React.createClass({

    propTypes: {
        onClick: React.PropTypes.func.isRequired
    },

    handleClick: function(e) {
        if (e) {
            e.preventDefault();
        }

        this.props.onClick();
    },

    render: function() {
        return (
            <a className='app-link' onClick={ this.handleClick }>
                { this.props.children }
            </a>
        );
    }
});


module.exports = AppLink;
