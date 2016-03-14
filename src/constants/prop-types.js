'use strict';

var React = require('react');

var { func, number, shape } = React.PropTypes;

var PropTypes = {
    
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
