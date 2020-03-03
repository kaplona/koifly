/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, render } from '@testing-library/react';

import BreadCrumbs from '../../src/components/common/bread-crumbs';


describe('BreadCrumbs component', () => {
  const mocks = {
    crumbsClassName: 'bread-crumbs',
    firstElementText: 'test first element text',
    secondElementText: 'test second element text',
    thirdElementText: 'test third element text'
  };

  afterEach(() => {
    cleanup();
  });

  it('renders proper layout and parsed element at proper places', () => {
    const { container, getByText } = render(
      <BreadCrumbs
        elements={[
          <div>{mocks.firstElementText}</div>,
          mocks.secondElementText,
          mocks.thirdElementText
        ]}
      />
    );
    const children = container.querySelector(`.${mocks.crumbsClassName}`).children;

    expect(children).to.have.lengthOf(3);
    expect(getByText(mocks.firstElementText)).to.be.ok;
    expect(getByText(`${mocks.secondElementText} /`)).to.be.ok;
    expect(getByText(mocks.thirdElementText)).to.be.ok;
  });
});
