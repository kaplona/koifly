/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, render } from '@testing-library/react';

import DesktopBottomGrid from '../../src/components/common/grids/desktop-bottom-grid';


describe('DesktopBottomGrid component', () => {
  let element;

  const mocks = {
    leftElement1Text: 'left-1-element',
    leftElement2Text: 'left-2-element',
    rightElementText: 'right-element'
  };

  beforeEach(() => {
    element = (
      <DesktopBottomGrid
        leftElements={[
          <div>{mocks.leftElement1Text}</div>,
          <div>{mocks.leftElement2Text}</div>
        ]}
        rightElement={<div>{mocks.rightElementText}</div>}
      />
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('renders passed elements', () => {
    const { getByText } = render(element);
    const leftElement1 = getByText(mocks.leftElement1Text);
    const leftElement2 = getByText(mocks.leftElement2Text);
    const rightElement = getByText(mocks.rightElementText);

    expect(leftElement1).to.be.ok;
    expect(leftElement2).to.be.ok;
    expect(rightElement).to.be.ok;
  });
});
