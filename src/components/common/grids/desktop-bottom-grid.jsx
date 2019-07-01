import React from 'react';
import { arrayOf, element, oneOfType, string } from 'prop-types';

require('./desktop-bottom-grid.less');


// defined as class for testing purposes
export default class DesktopBottomGrid extends React.Component {
  render() {
    return (
      <div className='bottom-grid'>
        <div className='left-elements'>
          {this.props.leftElements.map((el, index) => (
            <div key={'left-element-' + index}>{el}</div>
          ))}
        </div>

        <div className='right-element'>
          {this.props.rightElement}
        </div>
      </div>
    );
  }
}


DesktopBottomGrid.propTypes = {
  leftElements: arrayOf(oneOfType([element, string])),
  rightElement: oneOfType([element, string])
};
