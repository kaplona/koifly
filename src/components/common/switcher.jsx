import React from 'react';
import { func, oneOf, string } from 'prop-types';

require('./switcher.less');


export default class Switcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLeftPosition: (this.props.initialPosition === 'left')
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    if (this.state.isLeftPosition) {
      this.props.onRightClick();
    } else {
      this.props.onLeftClick();
    }
    this.setState({ isLeftPosition: !this.state.isLeftPosition });
  }

  render() {
    return (
      <div className='switcher' data-testid='switcher' onClick={this.handleClick}>
        <div className={this.state.isLeftPosition ? 'active' : null}>
          {this.props.leftButtonCaption}
        </div>
        <div className={this.state.isLeftPosition ? null : 'active'}>
          {this.props.rightButtonCaption}
        </div>
      </div>
    );
  }
}


Switcher.propTypes = {
  leftButtonCaption: string.isRequired,
  rightButtonCaption: string.isRequired,
  onLeftClick: func,
  onRightClick: func,
  initialPosition: oneOf(['left', 'right']).isRequired
};
