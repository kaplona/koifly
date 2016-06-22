'use strict';

var React = require('react');

require('./mobile-top-menu.less');


var MobileTopMenu = React.createClass({

    propTypes: {
        header: React.PropTypes.string,
        leftButtonCaption: React.PropTypes.string,
        rightButtonCaption: React.PropTypes.string,
        onLeftClick: React.PropTypes.func,
        onRightClick: React.PropTypes.func,
        isPositionFixed: React.PropTypes.bool.isRequired
    },

    getDefaultProps: function() {
        return {
            isPositionFixed: true
        };
    },

    render: function() {
        var className = 'mobile-top-menu';
        
        // Virtual keyboard breaks fixed position of the menu
        // thus we leave position: static if any input is focused
        // original solution: https://dansajin.com/2012/12/07/fix-position-fixed/
        if (!this.props.isPositionFixed) {
            className += ' x-static';
        }
        
        return (
            <div className={ className }>
                <div
                    className='top-navigation'
                    onClick={ this.props.onLeftClick }
                    ref='left-navigation'
                    onTouchStart={ () => {} } // required for iOS webkit browser to trigger :active pseudo state
                    >
                    { this.props.leftButtonCaption }
                </div>
                <div className='header'>
                    { this.props.header }
                </div>
                <div
                    className='top-navigation'
                    onClick={ this.props.onRightClick }
                    ref='right-navigation'
                    onTouchStart={ () => {} } // required for iOS webkit browser to trigger :active pseudo state
                    >
                    { this.props.rightButtonCaption }
                </div>
            </div>
        );
    }
});

module.exports = MobileTopMenu;
