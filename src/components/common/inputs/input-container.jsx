'use strict';

const React = require('react');

require('./input-container.less');


const ValueInput = React.createClass({
  render: function() {
    return (
      <div className='input-container'>
        <div className='arrow'>{'»'}</div>
        {this.props.children}
      </div>
    );
  }
});


module.exports = ValueInput;
