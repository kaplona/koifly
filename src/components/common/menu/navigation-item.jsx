'use strict';

const React = require('react');
const {bool, func, number, string} = React.PropTypes;

require('./navigation-item.less');


const NavigationItem = React.createClass({

  propTypes: {
    iconFileName: string.isRequired,
    label: string.isRequired,
    itemsNumber: number.isRequired,
    isActive: bool,
    onClick: func.isRequired
  },

  getDefaultProps: function () {
    return {
      isActive: false
    };
  },

  render: function () {
    let className = 'navigation-item-' + this.props.itemsNumber;
    if (this.props.isActive) {
      className += ' x-active';
    }

    const imgSrc = '/static/icons/' + this.props.iconFileName;

    return (
      <div
        className={className}
        onClick={this.props.onClick}
        onTouchStart={() => {
        }} // required for iOS webkit browser to trigger :active pseudo state
      >
        <div className='icon'>
          <img src={imgSrc} width='26px'/>
        </div>
        {this.props.label}
      </div>
    );
  }
});


module.exports = NavigationItem;
