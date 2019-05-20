'use strict';

const React = require('react');
const { bool, string } = React.PropTypes;
const browserHistory = require('react-router').browserHistory;
const FlightModel = require('../../../models/flight');
const GliderModel = require('../../../models/glider');
const NavigationItem = require('./navigation-item');
const SiteModel = require('../../../models/site');
const PilotModel = require('../../../models/pilot');

require('./navigation-menu.less');


const NavigationMenu = React.createClass({

  propTypes: {
    currentView: string,
    isMobile: bool.isRequired,
    isPositionFixed: bool.isRequired
  },

  getDefaultProps: function() {
    return {
      isMobile: false,
      isPositionFixed: true
    };
  },

  handleLinkTo: function(page) {
    browserHistory.push(`/${encodeURIComponent(page)}`);
  },

  render: function() {
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
          onClick={() => this.handleLinkTo('flights')}
        />
        <NavigationItem
          iconFileName='mountains.png'
          label='Sites'
          itemsNumber={itemsNumber}
          isActive={this.props.currentView === SiteModel.getModelKey()}
          onClick={() => this.handleLinkTo('sites')}
        />
        <NavigationItem
          iconFileName='glider.png'
          label='Gliders'
          itemsNumber={itemsNumber}
          isActive={this.props.currentView === GliderModel.getModelKey()}
          onClick={() => this.handleLinkTo('gliders')}
        />
        <NavigationItem
          iconFileName='statistics.png'
          label='Stats'
          itemsNumber={itemsNumber}
          isActive={this.props.currentView === 'stats'}
          onClick={() => this.handleLinkTo('stats')}
        />
        <NavigationItem
          iconFileName='person.png'
          label='Pilot'
          itemsNumber={itemsNumber}
          isActive={this.props.currentView === PilotModel.getModelKey()}
          onClick={() => this.handleLinkTo('pilot')}
        />
      </div>
    );
  }
});

module.exports = NavigationMenu;
