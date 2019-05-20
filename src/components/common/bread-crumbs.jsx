'use strict';

const React = require('react');
const { arrayOf, element, number, oneOfType, string } = React.PropTypes;
const _ = require('lodash');

require('./bread-crumbs.less');


const BreadCrumbs = React.createClass({
  propTypes: {
    elements: arrayOf(oneOfType([element, string, number])).isRequired
  },

  render() {
    const separator = ' / ';
    return (
      <div className='bread-crumbs'>
        {_.map(this.props.elements, (el, index, elements) => (
          <span key={`bread-crumb-${index}`}>
                        {el}
            {index < (elements.length - 1) ? separator : null}
                    </span>
        ))}
      </div>
    );
  }
});


module.exports = BreadCrumbs;
