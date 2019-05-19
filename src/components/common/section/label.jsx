'use strict';

const React = require('react');

require('./label.less');


const Label = React.createClass({
  render() {
    return (
      <div className='label'>
        {this.props.children}
      </div>
    );
  }
});


module.exports = Label;
