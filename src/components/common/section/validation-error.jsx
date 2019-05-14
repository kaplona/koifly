'use strict';

const React = require('react');
const { string } = React.PropTypes;

require('./validation-error.less');


function ValidationError(props) {
    return (
        <div className='validation-error'>
            {props.message}
        </div>
    );
}

ValidationError.propTypes = {
    message: string.isRequired
};


module.exports = ValidationError;
