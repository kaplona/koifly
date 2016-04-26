'use strict';

var React = require('react');

require('./mobile-top-menu.less');


var MobileTopMenu = React.createClass({

    propTypes: {
        header: React.PropTypes.string,
        leftButtonCaption: React.PropTypes.string,
        rightButtonCaption: React.PropTypes.string,
        onLeftClick: React.PropTypes.func,
        onRightClick: React.PropTypes.func
    },

    render: function() {
        return (
            <div className='mobile-top-menu'>
                <div
                    className='top-navigation'
                    onClick={ this.props.onLeftClick }
                    ref='left-navigation'
                    onTouchStart='' // required for iOS webkit browser to trigger :active pseudo state
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
                    onTouchStart='' // required for iOS webkit browser to trigger :active pseudo state
                    >
                    { this.props.rightButtonCaption }
                </div>
            </div>
        );
    }
});

module.exports = MobileTopMenu;
