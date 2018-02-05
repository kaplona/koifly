'use strict';

const React = require('react');
const { array, object, oneOfType, string } = React.PropTypes;

const koiflyErrorPropType = {
    type: string,
    message: string,
    errors: oneOfType([array, object])
};

module.exports = koiflyErrorPropType;
