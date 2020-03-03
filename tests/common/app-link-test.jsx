/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import Chai from 'chai';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import AppLink from '../../src/components/common/app-link';


describe('AppLink component', () => {
  let history;
  let handleClick;

  const mocks = {
    childText: 'test child type',
    href: '/mock/url'
  };

  beforeEach(() => {
    handleClick = Sinon.spy();
    history = {
      push: Sinon.spy()
    };
  });

  afterEach(() => {
    cleanup();
  });

  it('will push new router url if href prop is passed', () => {
    const { getByText } = render(
      <AppLink href={mocks.href} history={history} onClick={handleClick}>
        {mocks.childText}
      </AppLink>
    );
    const appLink = getByText(mocks.childText);
    fireEvent.click(appLink);

    expect(history.push).to.have.been.calledWith(mocks.href);
    expect(handleClick).to.not.be.called;
  });

  it('will allow for a link default behaviour if ctrl button was pressed', () => {
    const { getByText } = render(
      <AppLink href={mocks.href} onClick={handleClick}>
        {mocks.childText}
      </AppLink>
    );
    const appLink = getByText(mocks.childText);
    fireEvent.click(appLink, { ctrlKey: true });

    expect(history.push).to.not.be.called;
    expect(handleClick).to.not.be.called;
  });

  it('if only onClick prop was passed will call it', () => {
    const { getByText } = render(
      <AppLink onClick={handleClick}>
        {mocks.childText}
      </AppLink>
    );
    const appLink = getByText(mocks.childText);
    fireEvent.click(appLink);

    expect(handleClick).to.have.been.calledOnce;
  });
});
