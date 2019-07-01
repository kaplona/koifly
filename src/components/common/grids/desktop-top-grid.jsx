import React from 'react';
import { element } from 'prop-types';

require('./desktop-top-grid.less');


// defined as class for testing purposes
export default class DesktopTopGrid extends React.Component {
  render() {
    return (
      <div className='top-grid'>
        <div className='left-element'>
          {this.props.leftElement}
        </div>

        <div className='middle-element'>
          {this.props.middleElement}
        </div>

        <div className='right-element'>
          {this.props.rightElement}
        </div>
      </div>
    );
  }
}

DesktopTopGrid.propTypes = {
  leftElement: element,
  middleElement: element,
  rightElement: element
};

