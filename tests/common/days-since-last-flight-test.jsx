/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, render } from '@testing-library/react';

import DaysSinceLastFlight from '../../src/components/common/days-since-last-flight';


describe('DaysSinceLastFlight component', () => {
  const defaults = {
    noFlightsYetText: 'No flights yet',
    todayText: 'You had a blast today!',
    greenClassName: 'x-green'
  };

  const mocks = {
    moreThatTwoWeeks: 32,
    lessThatTwoWeeks: 5
  };

  afterEach(() => {
    cleanup();
  });

  it('renders default text if no flights yet', () => {
    const { getByText } = render(<DaysSinceLastFlight />);
    const element = getByText(defaults.noFlightsYetText);
    const className = element.className;

    expect(element).to.be.ok;
    expect(className).to.not.contain(defaults.greenClassName);
  });


  describe('Days props testing', () => {
    it('renders text with parsed days', () => {
      const { getByText } = render(
        <DaysSinceLastFlight days={mocks.moreThatTwoWeeks} />
      );
      const element = getByText(`${mocks.moreThatTwoWeeks} days since last flight`);
      const className = element.className;

      expect(element).to.be.ok;
      expect(className).to.not.contain(defaults.greenClassName);
    });

    it('highlights text in green if passed days are less than two weeks', () => {
      const { getByText } = render(
        <DaysSinceLastFlight days={mocks.lessThatTwoWeeks} />
      );
      const element = getByText(`${mocks.lessThatTwoWeeks} days since last flight`);
      const className = element.className;

      expect(className).to.contain(defaults.greenClassName);
    });

    it('today text test', () => {
      const { getByText } = render(
        <DaysSinceLastFlight days={0} />
      );
      const element = getByText(defaults.todayText);
      const className = element.className;

      expect(className).to.contain(defaults.greenClassName);
    });
  });
});
