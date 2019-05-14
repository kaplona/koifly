'use strict';

const React = require('react');
const { bool, func, string } = React.PropTypes;

require('./mobile-top-menu.less');


const MobileTopMenu = React.createClass({

    propTypes: {
        header: string,
        leftButtonCaption: string,
        rightButtonCaption: string,
        onLeftClick: func,
        onRightClick: func,
        isPositionFixed: bool
    },

    getDefaultProps: function() {
        return {
            isPositionFixed: true
        };
    },

    render: function() {
        let className = 'mobile-top-menu';
        // Virtual keyboard breaks fixed position of the menu
        // thus we leave position: static if any input is focused
        // original solution: https://dansajin.com/2012/12/07/fix-position-fixed/
        if (!this.props.isPositionFixed) {
            className += ' x-static';
        }
        
        return (
            <div className={className}>
                <div
                    className='top-navigation'
                    onClick={this.props.onLeftClick}
                    ref='left-navigation'
                    onTouchStart={() => {}} // required for iOS webkit browser to trigger :active pseudo state
                >
                    {this.props.leftButtonCaption}
                </div>
                <div className='header'>
                    {this.props.header}
                </div>
                <div
                    className='top-navigation'
                    onClick={this.props.onRightClick}
                    ref='right-navigation'
                    onTouchStart={() => {}} // required for iOS webkit browser to trigger :active pseudo state
                >
                    {this.props.rightButtonCaption}
                </div>
            </div>
        );
    }
});

module.exports = MobileTopMenu;
