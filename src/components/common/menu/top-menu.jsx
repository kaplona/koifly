'use strict';

var React = require('react');

require('./top-menu.less');


var TopMenu = React.createClass({

    propTypes: {
        headerText: React.PropTypes.string,
        leftText: React.PropTypes.string,
        rightText: React.PropTypes.string,
        onLeftClick: React.PropTypes.func,
        onRightClick: React.PropTypes.func
    },

    render: function() {
        return (
            <div className='top-menu'>
                <div className='top-navigation' onClick={ this.props.onLeftClick }>
                    { this.props.leftText }
                </div>
                <div className='header'>
                    { this.props.headerText }
                </div>
                <div className='top-navigation' onClick={ this.props.onRightClick }>
                    { this.props.rightText }
                </div>
            </div>
        );
    }
});

module.exports = TopMenu;
