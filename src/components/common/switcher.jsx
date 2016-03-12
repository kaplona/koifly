'use strict';

var React = require('react');

require('./switcher.less');


var Switcher = React.createClass({

    propTypes: {
        leftButtonCaption: React.PropTypes.string.isRequired,
        rightButtonCaption: React.PropTypes.string.isRequired,
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
                <div className={ this.state.isLeftPosition ? 'active' : null }>
                    { this.props.leftButtonCaption }
                </div>
                <div className={ this.state.isLeftPosition ? null : 'active' }>
                    { this.props.rightButtonCaption }
                </div>
            </div>
        );
    }
});


module.exports = Switcher;
