import React from 'react';
import { bool } from 'prop-types';

if (process.env.BROWSER) {
  require('./home-block.less');
}


export default class HomeBlock extends React.Component {
  render() {
    return (
      <div className={`home-block ${this.props.noMargin ? 'no-margin' : ''}`}>
        {this.props.children}
      </div>
    );
  }
}


HomeBlock.defaultProps = {
  noMargin: false
};

HomeBlock.propTypes = {
  noMargin: bool
};
