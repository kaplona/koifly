'use strict';

var React = require('react');


var NavigationItem = React.createClass({

    propTypes: {
        itemsNumber: React.PropTypes.number,
        isActive: React.PropTypes.bool,
        onClick: React.PropTypes.func
    },

    render: function() {
        var className = 'navigation-item-' + this.props.itemsNumber;
        if (this.props.isActive) {
            className += ' active-menu-item';
        }

        return (
            <div className={ className } onClick={ this.props.onClick }>
                { this.props.children }
            </div>
        );
    }
});


module.exports = NavigationItem;
