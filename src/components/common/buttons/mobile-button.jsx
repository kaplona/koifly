import React from 'react';
import Button from './button';

require('./mobile-button.less');


// defined as class for testing purposes
export default class MobileButton extends React.Component {
  render() {
    return <Button {...this.props} isMobile={true}/>;
  }
}
