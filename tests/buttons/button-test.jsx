/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import Chai from 'chai';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import Button from '../../src/components/common/buttons/button';


describe('Button component', () => {
  let element;
  let handleClick;

  const defaults = {
    type: 'button',
    className: 'button',
    desktopClassName: 'desktop-only',
    mobileClassName: 'mobile-button'
  };

  const mocks = {
    buttonCaption: 'test button',
    buttonStyle: 'primary'
  };

  beforeEach(() => {
    handleClick = Sinon.spy();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Defaults and behavior testing', () => {
    beforeEach(() => {
      element = (
        <Button
          caption={mocks.buttonCaption}
          buttonStyle={mocks.buttonStyle}
          onClick={handleClick}
        />
      );
    });

    it('renders button with proper text', () => {
      const { getByText } = render(element);

      expect(getByText(mocks.buttonCaption)).to.be.ok;
    });

    it('button is enabled', () => {
      const { getByText } = render(element);
      const button = getByText(mocks.buttonCaption);

      expect(button).to.have.property('type', defaults.type);
      expect(button).to.have.property('disabled', false);
    });

    it('renders an element with proper default classes', () => {
      const { getByText } = render(element);
      const button = getByText(mocks.buttonCaption);
      const classList = button.classList;

      expect(classList).to.have.lengthOf(3);
      expect(classList[0]).to.equal(defaults.className);
      expect(classList[1]).to.equal(defaults.desktopClassName);
      expect(classList[2]).to.equal(`x-${mocks.buttonStyle}`);
    });

    it('triggers onClick handler once clicked', () => {
      const { getByText } = render(element);
      const button = getByText(mocks.buttonCaption);
      fireEvent.click(button);

      expect(handleClick).to.have.been.calledOnce;
    });
  });


  describe('Different props testing', () => {
    beforeEach(() => {
      element = (
        <Button
          caption={mocks.buttonCaption}
          type='submit'
          isMobile={true}
          isEnabled={false}
          onClick={handleClick}
        />
      );
    });

    it('renders a disabled button', () => {
      const { getByText } = render(element);
      const button = getByText(mocks.buttonCaption);

      expect(button).to.have.property('disabled', true);
    });

    it('renders a submit button', () => {
      const { getByText } = render(element);
      const button = getByText(mocks.buttonCaption);

      expect(button).to.have.property('type', 'submit');
    });

    it('renders a button which css class we want', () => {
      const { getByText } = render(element);
      const button = getByText(mocks.buttonCaption);
      const className = button.className;

      expect(className).to.equal(defaults.mobileClassName);
    });

    it('doesn\'t trigger onClick handler once clicked', () => {
      const { getByText } = render(element);
      const button = getByText(mocks.buttonCaption);
      fireEvent.click(button);

      expect(handleClick).to.not.be.called;
    });
  });
});
