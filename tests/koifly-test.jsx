/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, render } from '@testing-library/react';

import Koifly from '../src/components/koifly';


describe('main Koifly app component', () => {
  const mocks = {
    childText: 'test child text',
    childClassName: 'childClass'
  };

  afterEach(() => {
    cleanup();
  });

  it('renders header component and parsed children', () => {
    const element = (
      <Koifly>
        <div className={mocks.childClassName}>{mocks.childText}</div>
      </Koifly>
    );
    const { container, getByTestId } = render(element);

    const children = container.querySelector(`.${mocks.childClassName}`);

    expect(children).to.have.property('textContent', mocks.childText);
    expect(getByTestId('header')).to.be.ok;
  });
});
