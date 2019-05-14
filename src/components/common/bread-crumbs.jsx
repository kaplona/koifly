'use strict';

const React = require('react');
const { arrayOf, element, number, oneOfType, string } = React.PropTypes;
const _ = require('lodash');

require('./bread-crumbs.less');


function BreadCrumbs(props) {
    const separator = ' / ';
    return (
        <div className='bread-crumbs'>
            {_.map(props.elements, (el, index, elements) => (
                <span key={`bread-crumb-${index}`}>
                    {el}
                    {index < (elements.length - 1) ? separator : null}
                </span>
            ))}
        </div>
    );
}

BreadCrumbs.propTypes = {
    elements: arrayOf(oneOfType([element, string, number])).isRequired
};


module.exports = BreadCrumbs;
