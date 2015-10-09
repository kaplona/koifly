'use strict';

var React = require('react');


var BackButton = React.createClass({

    propTypes: {
        onClick: React.PropTypes.func
    },

    render: function() {
        return (
            <div className='back_button' onClick={ this.props.onClick } >
                { this.props.children }
            </div>
        );
    }
});


module.exports = BackButton;