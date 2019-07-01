import React from 'react';
import { arrayOf, element, number, oneOfType, string } from 'prop-types';

require('./bread-crumbs.less');


// defined as class for testing purposes
export default class BreadCrumbs extends React.Component {
  render() {
    const separator = ' / ';
    return (
      <div className='bread-crumbs'>
        {this.props.elements.map((el, index, elements) => (
          <span key={`bread-crumb-${index}`}>
            {el}
            {index < (elements.length - 1) ? separator : null}
          </span>
        ))}
      </div>
    );
  }
}


BreadCrumbs.propTypes = {
  elements: arrayOf(oneOfType([element, string, number])).isRequired
};
