'use strict';

const React = require('react');

require('./desktop-top-grid.less');


const DesktopTopGrid = React.createClass({

  propTypes: {
    leftElement: React.PropTypes.element,
    middleElement: React.PropTypes.element,
    rightElement: React.PropTypes.element
  },

  render: function() {
    return (
      <div className='top-grid'>
        <div className='left-element'>
          {this.props.leftElement}
        </div>

        <div className='middle-element'>
          {this.props.middleElement}
        </div>

        <div className='right-element'>
          {this.props.rightElement}
        </div>
      </div>
    );
  }
});


module.exports = DesktopTopGrid;
