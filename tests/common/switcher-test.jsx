/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import Chai from 'chai';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import Switcher from '../../src/components/common/switcher';


describe('Switcher component', () => {
  let element;
  let handleLeftClick;
  let handleRightClick;

  const defaults = {
    leftPosition: 'left',
    rightPosition: 'right',
    activeClass: 'active'
  };

  const mocks = {
    leftButtonCaption: 'left test caption',
    rightButtonCaption: 'right test caption'
  };

  beforeEach(() => {
    handleLeftClick = Sinon.spy();
    handleRightClick = Sinon.spy();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Defaults testing', () => {
    beforeEach(() => {
      element = (
        <Switcher
          leftButtonCaption={mocks.leftButtonCaption}
          rightButtonCaption={mocks.rightButtonCaption}
          onLeftClick={handleLeftClick}
          onRightClick={handleRightClick}
        />
      );
    });

    it('renders passed button captures', () => {
      const { getByText } = render(element);
      const leftButton = getByText(mocks.leftButtonCaption);
      const rightButton = getByText(mocks.rightButtonCaption);

      expect(leftButton).to.be.ok;
      expect(rightButton).to.be.ok;
    });

    it('sets proper initial state', () => {
      const { getByText } = render(element);
      const rightButton = getByText(mocks.rightButtonCaption);

      expect(rightButton.className).to.contain(defaults.activeClass);
    });

    it('Switches between buttons and calls proper callbacks when clicked', () => {
      const { getByText, getByTestId } = render(element);
      const switcher = getByTestId('switcher');

      fireEvent.click(switcher);

      let leftButton = getByText(mocks.leftButtonCaption);
      let rightButton = getByText(mocks.rightButtonCaption);

      expect(leftButton.className).to.contain(defaults.activeClass);
      expect(rightButton.className).to.not.contain(defaults.activeClass);
      expect(handleLeftClick).to.have.been.calledOnce;
      expect(handleRightClick).to.have.not.been.called;

      fireEvent.click(switcher);

      leftButton = getByText(mocks.leftButtonCaption);
      rightButton = getByText(mocks.rightButtonCaption);

      expect(leftButton.className).to.not.contain(defaults.activeClass);
      expect(rightButton.className).to.contain(defaults.activeClass);
      expect(handleLeftClick).to.have.been.calledOnce;
      expect(handleRightClick).to.have.been.calledOnce;
    });
  });

  describe('Passing initial position', () => {
    it('highlights right part of the switch', () => {
      element = (
        <Switcher
          initialPosition={defaults.rightPosition}
          leftButtonCaption={mocks.leftButtonCaption}
          rightButtonCaption={mocks.rightButtonCaption}
          onLeftClick={handleLeftClick}
          onRightClick={handleRightClick}
        />
      );

      const { getByText } = render(element);
      const rightButton = getByText(mocks.rightButtonCaption);

      expect(rightButton.className).to.contain(defaults.activeClass);
    });

    it('highlights left part of the switch', () => {
      element = (
        <Switcher
          initialPosition={defaults.leftPosition}
          leftButtonCaption={mocks.leftButtonCaption}
          rightButtonCaption={mocks.rightButtonCaption}
          onLeftClick={handleLeftClick}
          onRightClick={handleRightClick}
        />
      );

      const { getByText } = render(element);
      const leftButton = getByText(mocks.leftButtonCaption);

      expect(leftButton.className).to.contain(defaults.activeClass);
    });
  });
});
