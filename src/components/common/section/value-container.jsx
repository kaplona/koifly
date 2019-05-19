'use strict';

const React = require('react');

require('./value-container.less');


const Value = React.createClass({
  render() {
    return (
      <div className='value-container'>
        {this.props.children}
      </div>
    );
  }
});


module.exports = Value;
