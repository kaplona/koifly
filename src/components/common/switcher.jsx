'use strict';

var React = require('react');

require('./switcher.less');


var Switcher = React.createClass({

    propTypes: {
        leftText: React.PropTypes.string.isRequired,
        rightText: React.PropTypes.string.isRequired,
        onLeftClick: React.PropTypes.func,
        onRightClick: React.PropTypes.func,
        initialPosition: React.PropTypes.oneOf(['left', 'right']).isRequired
    },

    getInitialState: function() {
        return {
            isLeftPosition: (this.props.initialPosition === 'left')
        };
    },

    handleClick: function() {
        if (this.state.isLeftPosition) {
            this.props.onRightClick();
        } else {
            this.props.onLeftClick();
        }
        this.setState({ isLeftPosition: !this.state.isLeftPosition });
    },

    render: function() {
        return (
            <div className='switcher' onClick={ this.handleClick }>
                <div className={ this.state.isLeftPosition ? 'active' : '' }>
                    { this.props.leftText }
                </div>
                <div className={ this.state.isLeftPosition ? '' : 'active' }>
                    { this.props.rightText }
                </div>
            </div>
        );
    }
});


module.exports = Switcher;
