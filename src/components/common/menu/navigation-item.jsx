import React from 'react';
import { bool, func, number, string } from 'prop-types';

require('./navigation-item.less');


// defined as class for testing purposes
export default class NavigationItem extends React.Component {
  render() {
    let className = 'navigation-item-' + this.props.itemsNumber;
    if (this.props.isActive) {
      className += ' x-active';
    }

    const imgSrc = '/static/icons/' + this.props.iconFileName;

    return (
      <div
        className={className}
        data-testid='navigation-item'
        onClick={this.props.onClick}
        onTouchStart={() => {}} // required for iOS webkit browser to trigger :active pseudo state
      >
        <div className='icon'>
          <img src={imgSrc} width='26px'/>
        </div>
        {this.props.label}
      </div>
    );
  }
}


NavigationItem.defaultProps = {
  isActive: false
};

NavigationItem.propTypes = {
  iconFileName: string.isRequired,
  label: string.isRequired,
  itemsNumber: number.isRequired,
  isActive: bool,
  onClick: func.isRequired
};
