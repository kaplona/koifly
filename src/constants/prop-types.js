'use strict';

const React = require('react');
const { func, number, shape } = React.PropTypes;

const PropTypes = {
    
    promise: shape({
        then: func.isRequired,
        catch: func
    }),
    
    coordinates: shape({
        lat: number.isRequired,
        lng: number.isRequired
    })
};


module.exports = PropTypes;
