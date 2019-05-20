'use strict';

const React = require('react');
const { string } = React.PropTypes;

require('./validation-error.less');


const ValidationError = React.createClass({
  propTypes: {
    message: string.isRequired
  },

  render() {
    return (
      <div className='validation-error'>
        {this.props.message}
      </div>
    );
  }
});


module.exports = ValidationError;
