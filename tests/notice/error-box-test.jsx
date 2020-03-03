/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import Chai from 'chai';
import errorTypes from '../../src/errors/error-types';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import ErrorBox from '../../src/components/common/notice/error-box';


describe('ErrorBox component', () => {
  let handleTryAgain;

  const defaults = {
    noticeType: 'error',
    buttonText: 'Try Again',
    buttonTryingText: 'Trying ...'
  };

  const mocks = {
    error: { type: 'testError', message: 'test error' },
    recordNotFoundError: { type: errorTypes.RECORD_NOT_FOUND, message: 'non clickable error box' },
    validationError: { type: errorTypes.VALIDATION_ERROR, message: 'non clickable error box' }
  };

  before(() => {
    Sinon.stub(window, 'scrollTo');
  });

  after(() => {
    window.scrollTo.restore();
  });

  beforeEach(() => {
    handleTryAgain = Sinon.spy();
  });

  afterEach(() => {
    cleanup();
  });


  it('renders notice with proper default props', () => {
    const { getByText } = render(<ErrorBox error={mocks.error} onTryAgain={handleTryAgain}/>);
    const errorMessage = getByText(mocks.error.message);
    const tryAgainButton = getByText(defaults.buttonText);

    expect(errorMessage).to.be.ok;
    expect(tryAgainButton).to.be.ok;
  });

  it('calls callback when Try Again button is clicked', () => {
    const { getByText } = render(<ErrorBox error={mocks.error} onTryAgain={handleTryAgain}/>);
    const tryAgainButton = getByText(defaults.buttonText);
    fireEvent.click(tryAgainButton);

    expect(handleTryAgain).to.have.been.calledOnce;
  });

  it('renders correct button text when loading', () => {
    const { getByText } = render(
      <ErrorBox
        error={mocks.error}
        isTrying={true}
        onTryAgain={handleTryAgain}
      />
    );
    const tryAgainButton = getByText(defaults.buttonTryingText);

    expect(tryAgainButton).to.be.ok;
  });

  it('doesn\'t show Try Again button for RECORD_NOT_FOUND errors', () => {
    const { queryByText } = render(<ErrorBox error={mocks.recordNotFoundError} onTryAgain={handleTryAgain}/>);
    const tryAgainButton = queryByText(defaults.buttonText);

    expect(tryAgainButton).to.not.be.ok;
  });

  it('doesn\'t show Try Again button for VALIDATION_ERROR errors', () => {
    const { queryByText } = render(<ErrorBox error={mocks.validationError} onTryAgain={handleTryAgain}/>);
    const tryAgainButton = queryByText(defaults.buttonText);

    expect(tryAgainButton).to.not.be.ok;
  });
});
