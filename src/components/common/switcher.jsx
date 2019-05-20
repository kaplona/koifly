'use strict';

const React = require('react');
const { func, oneOf, string } = React.PropTypes;

require('./switcher.less');


const Switcher = React.createClass({

  propTypes: {
    leftButtonCaption: string.isRequired,
    rightButtonCaption: string.isRequired,
    onLeftClick: func,
    onRightClick: func,
    initialPosition: oneOf(['left', 'right']).isRequired
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
      <div className='switcher' onClick={this.handleClick}>
        <div className={this.state.isLeftPosition ? 'active' : null}>
          {this.props.leftButtonCaption}
        </div>
        <div className={this.state.isLeftPosition ? null : 'active'}>
          {this.props.rightButtonCaption}
        </div>
      </div>
    );
  }
});


module.exports = Switcher;
