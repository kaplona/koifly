/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import Chai from 'chai';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import MobileTopMenu from '../../src/components/common/menu/mobile-top-menu';


describe('MobileTopMenu component', () => {
  let element;
  let handleLeftClick;
  let handleRightClick;

  const mocks = {
    headerText: 'test header text',
    leftButtonCaption: 'test left capture',
    rightButtonCaption: 'test right capture'
  };

  beforeEach(() => {
    handleLeftClick = Sinon.spy();
    handleRightClick = Sinon.spy();
  });

  afterEach(() => {
    cleanup();
  });


  beforeEach(() => {
    element = (
      <MobileTopMenu
        header={mocks.headerText}
        leftButtonCaption={mocks.leftButtonCaption}
        rightButtonCaption={mocks.rightButtonCaption}
        onLeftClick={handleLeftClick}
        onRightClick={handleRightClick}
      />
    );
  });

  it('renders passed header text', () => {
    const { getByText } = render(element);
    const header = getByText(mocks.headerText);

    expect(header).to.be.ok;
  });

  it('triggers correct callback when right and left elements are clicked', () => {
    const { getByText } = render(element);
    const leftNavigationElement = getByText(mocks.leftButtonCaption);

    fireEvent.click(leftNavigationElement);

    expect(handleLeftClick).to.be.calledOnce;
    expect(handleRightClick).to.not.be.called;

    const rightNavigationElement = getByText(mocks.rightButtonCaption);

    fireEvent.click(rightNavigationElement);

    expect(handleLeftClick).to.be.calledOnce; // to still be called just once
    expect(handleRightClick).to.be.calledOnce;
  });
});
