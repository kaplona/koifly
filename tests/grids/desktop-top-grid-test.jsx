/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, render } from '@testing-library/react';

import DesktopTopGrid from '../../src/components/common/grids/desktop-top-grid';


describe('DesktopTopGrid component', () => {
  let element;

  const mocks = {
    leftElementText: 'left-element',
    middleElementText: 'middle-element',
    rightElementText: 'right-element'
  };

  beforeEach(() => {
    element = (
      <DesktopTopGrid
        leftElement={<div>{mocks.leftElementText}</div>}
        middleElement={<div>{mocks.middleElementText}</div>}
        rightElement={<div>{mocks.rightElementText}</div>}
      />
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('renders passed elements', () => {
    const { getByText } = render(element);
    const leftElement = getByText(mocks.leftElementText);
    const middleElement = getByText(mocks.middleElementText);
    const rightElement = getByText(mocks.rightElementText);

    expect(leftElement).to.be.ok;
    expect(middleElement).to.be.ok;
    expect(rightElement).to.be.ok;
  });
});
