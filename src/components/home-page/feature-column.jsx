import React from 'react';
import { oneOf } from 'prop-types';

if (process.env.BROWSER) {
  require('./feature-column.less');
}


// defined as class for testing purposes
export default class FeatureColumn extends React.Component {
  render() {
    let className = 'feature-column';
    if (this.props.float) {
      className += ' x-' + this.props.float + '-float';
    }

    return (
      <div className={className}>
        {this.props.children}
      </div>
    );
  }
}


FeatureColumn.propTypes = {
  float: oneOf(['left', 'right'])
};
