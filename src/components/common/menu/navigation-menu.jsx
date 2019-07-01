import React from 'react';
import { bool, string } from 'prop-types';
import FlightModel from '../../../models/flight';
import GliderModel from '../../../models/glider';
import NavigationItem from './navigation-item';
import navigationService from '../../../services/navigation-service';
import SiteModel from '../../../models/site';
import PilotModel from '../../../models/pilot';

require('./navigation-menu.less');


// defined as class for testing purposes
export default class NavigationMenu extends React.Component {
  render() {
    const itemsNumber = 5;
    let className = 'navigation-menu';
    if (this.props.isMobile) {
      className += ' x-mobile';
    }

    // Virtual keyboard breaks fixed position of the menu
    // thus we leave position: static if any input is focused
    // original solution: https://dansajin.com/2012/12/07/fix-position-fixed/
    if (!this.props.isPositionFixed) {
      className += ' x-static';
    }

    return (
      <div className={className}>
        <NavigationItem
          iconFileName='log-book.png'
          label='Flights'
          itemsNumber={itemsNumber}
          isActive={this.props.currentView === FlightModel.getModelKey()}
          onClick={navigationService.goToFlightLog}
        />
        <NavigationItem
          iconFileName='mountains.png'
          label='Sites'
          itemsNumber={itemsNumber}
          isActive={this.props.currentView === SiteModel.getModelKey()}
          onClick={navigationService.goToSiteListView}
        />
        <NavigationItem
          iconFileName='glider.png'
          label='Gliders'
          itemsNumber={itemsNumber}
          isActive={this.props.currentView === GliderModel.getModelKey()}
          onClick={navigationService.goToGliderListView}
        />
        <NavigationItem
          iconFileName='statistics.png'
          label='Stats'
          itemsNumber={itemsNumber}
          isActive={this.props.currentView === 'stats'}
          onClick={navigationService.goToStatsView}
        />
        <NavigationItem
          iconFileName='person.png'
          label='Pilot'
          itemsNumber={itemsNumber}
          isActive={this.props.currentView === PilotModel.getModelKey()}
          onClick={navigationService.goToPilotView}
        />
      </div>
    );
  }
}


NavigationMenu.defaultProps = {
  isMobile: false,
  isPositionFixed: true
};

NavigationMenu.propTypes = {
  currentView: string,
  isMobile: bool,
  isPositionFixed: bool
};
