/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import Chai from 'chai';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import NavigationItem from '../../src/components/common/menu/navigation-item';


describe('NavigationItem component', () => {
  let element;
  let handleClick;

  const defaults = {
    itemClassName: 'navigation-item-',
    activeClassName: 'x-active'
  };

  const mocks = {
    iconFileName: 'test-file.gif',
    itemLabel: 'test label',
    itemsNumber: 3
  };

  beforeEach(() => {
    handleClick = Sinon.spy();
  });

  afterEach(() => {
    cleanup();
  });


  describe('Defaults testing', () => {
    beforeEach(() => {
      element = (
        <NavigationItem
          iconFileName={mocks.iconFileName}
          label={mocks.itemLabel}
          itemsNumber={mocks.itemsNumber}
          onClick={handleClick}
        />
      );
    });

    it('renders provided label and sets default styles', () => {
      const { container, getByText } = render(element);
      const label = getByText(mocks.itemLabel);
      const img = container.querySelector('img');

      expect(label.className).to.contain(`${defaults.itemClassName}${mocks.itemsNumber}`);
      expect(img).to.have.property('src').that.contain(mocks.iconFileName);
    });

    it('triggers onClick event once clicked', () => {
      const { getByText } = render(element);
      const label = getByText(mocks.itemLabel);
      fireEvent.click(label);

      expect(handleClick).to.be.calledOnce;
    });
  });


  describe('isActive testing', () => {
    it('marks navigation item as active if isActive prop was passed', () => {
      element = (
        <NavigationItem
          iconFileName={mocks.iconFileName}
          label={mocks.itemLabel}
          itemsNumber={mocks.itemsNumber}
          isActive={true}
          onClick={handleClick}
        />
      );
      const { getByText } = render(element);
      const label = getByText(mocks.itemLabel);

      expect(label.className).to.contain(defaults.activeClassName);
    });
  });
});
