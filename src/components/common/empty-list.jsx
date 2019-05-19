'use strict';

const React = require('react');
const {func, string} = React.PropTypes;

require('./empty-list.less');

const EmptyList = React.createClass({
  propTypes: {
    ofWhichItems: string.isRequired, // plural
    onAdding: func.isRequired
  },
  render() {
    return (
      <div className='empty-list'>
        <div>{'You don\'t have any ' + this.props.ofWhichItems + ' yet'}</div>
        <div className='add-button' onClick={this.props.onAdding}>+</div>
      </div>
    );
  }
});


module.exports = EmptyList;
