/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import FlightModel from '../../src/models/flight';
import GliderModel from '../../src/models/glider';
import SiteModel from '../../src/models/site';
import PilotModel from '../../src/models/pilot';

import NavigationMenu from '../../src/components/common/menu/navigation-menu';


describe('BottomMenu component', () => {
  const defaults = {
    mobileClassName: 'x-mobile',
    activeClassName: 'x-active',
    flightsLabel: 'Flights',
    sitesLabel: 'Sites',
    glidersLabel: 'Gliders',
    statsLabel: 'Stats',
    pilotLabel: 'Pilot'
  };

  afterEach(() => {
    cleanup();
  });


  it('renders default class and doesn\'t highlight any navigation items', () => {
    const { container, queryAllByTestId } = render(<NavigationMenu />);
    const mobileMenu = container.querySelector(`.${defaults.mobileClassName}`);

    expect(mobileMenu).to.not.be.ok;

    const navigationItems = queryAllByTestId('navigation-item');

    expect(navigationItems).to.have.lengthOf(5);
    expect(navigationItems[0].className).to.not.contain(defaults.activeClassName);
    expect(navigationItems[1].className).to.not.contain(defaults.activeClassName);
    expect(navigationItems[2].className).to.not.contain(defaults.activeClassName);
    expect(navigationItems[3].className).to.not.contain(defaults.activeClassName);
    expect(navigationItems[4].className).to.not.contain(defaults.activeClassName);
  });

  it('renders mobile class if required', () => {
    const { container } = render(<NavigationMenu isMobile={true} />);
    const mobileMenu = container.querySelector(`.${defaults.mobileClassName}`);

    expect(mobileMenu).to.be.ok;
  });

  it('highlights only flights navigation item', () => {
    const { getByText } = render(<NavigationMenu currentView={FlightModel.getModelKey()} />);

    expect(getByText(defaults.flightsLabel).className).to.contain(defaults.activeClassName);
    expect(getByText(defaults.sitesLabel).className).to.not.contain(defaults.activeClassName);
    expect(getByText(defaults.glidersLabel).className).to.not.contain(defaults.activeClassName);
    expect(getByText(defaults.statsLabel).className).to.not.contain(defaults.activeClassName);
    expect(getByText(defaults.pilotLabel).className).to.not.contain(defaults.activeClassName);
  });

  it('highlights only sites navigation item', () => {
    const { getByText } = render(<NavigationMenu currentView={SiteModel.getModelKey()} />);

    expect(getByText(defaults.flightsLabel).className).to.not.contain(defaults.activeClassName);
    expect(getByText(defaults.sitesLabel).className).to.contain(defaults.activeClassName);
    expect(getByText(defaults.glidersLabel).className).to.not.contain(defaults.activeClassName);
    expect(getByText(defaults.statsLabel).className).to.not.contain(defaults.activeClassName);
    expect(getByText(defaults.pilotLabel).className).to.not.contain(defaults.activeClassName);
  });

  it('highlights only gliders navigation item', () => {
    const { getByText } = render(<NavigationMenu currentView={GliderModel.getModelKey()} />);

    expect(getByText(defaults.flightsLabel).className).to.not.contain(defaults.activeClassName);
    expect(getByText(defaults.sitesLabel).className).to.not.contain(defaults.activeClassName);
    expect(getByText(defaults.glidersLabel).className).to.contain(defaults.activeClassName);
    expect(getByText(defaults.statsLabel).className).to.not.contain(defaults.activeClassName);
    expect(getByText(defaults.pilotLabel).className).to.not.contain(defaults.activeClassName);
  });

  it('highlights only stats navigation item', () => {
    const { getByText } = render(<NavigationMenu currentView='stats' />);

    expect(getByText(defaults.flightsLabel).className).to.not.contain(defaults.activeClassName);
    expect(getByText(defaults.sitesLabel).className).to.not.contain(defaults.activeClassName);
    expect(getByText(defaults.glidersLabel).className).to.not.contain(defaults.activeClassName);
    expect(getByText(defaults.statsLabel).className).to.contain(defaults.activeClassName);
    expect(getByText(defaults.pilotLabel).className).to.not.contain(defaults.activeClassName);
  });

  it('highlights only pilot navigation item', () => {
    const { getByText } = render(<NavigationMenu currentView={PilotModel.getModelKey()} />);

    expect(getByText(defaults.flightsLabel).className).to.not.contain(defaults.activeClassName);
    expect(getByText(defaults.sitesLabel).className).to.not.contain(defaults.activeClassName);
    expect(getByText(defaults.glidersLabel).className).to.not.contain(defaults.activeClassName);
    expect(getByText(defaults.statsLabel).className).to.not.contain(defaults.activeClassName);
    expect(getByText(defaults.pilotLabel).className).to.contain(defaults.activeClassName);
  });
});
