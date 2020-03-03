/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import Chai from 'chai';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import MobileButton from '../../src/components/common/buttons/mobile-button';


describe('MobileButton component', () => {
  let element;
  let handleClick;

  const defaults = {
    mobileClassName: 'mobile-button'
  };

  const mocks = {
    buttonText: 'test button',
    buttonType: 'submit',
    buttonStyle: 'secondary'
  };

  beforeEach(() => {
    handleClick = Sinon.spy();

    element = (
      <MobileButton
        caption={mocks.buttonText}
        type={mocks.buttonType}
        buttonStyle={mocks.buttonStyle}
        onClick={handleClick}
      />
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('renders a button with proper attributes', () => {
    const { getByText } = render(element);
    const button = getByText(mocks.buttonText);
    const className = button.className;

    expect(button).to.have.property('type', mocks.buttonType);
    expect(button).to.have.property('disabled', false);
    expect(className).to.equal(`${defaults.mobileClassName} x-${mocks.buttonStyle}`);
  });

  it('triggers onClick handler once clicked', () => {
    const { getByText } = render(element);
    const button = getByText(mocks.buttonText);
    fireEvent.click(button);

    expect(handleClick).to.have.been.calledOnce;
  });
});
