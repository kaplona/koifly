/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import Chai from 'chai';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import EmptyList from '../../src/components/common/empty-list';


describe('EmptyList component', () => {
  let handleAdding;
  let element;

  const mocks = {
    itemsName: 'TESTS'
  };

  beforeEach(() => {
    handleAdding = Sinon.spy();

    element = (
      <EmptyList
        ofWhichItems={mocks.itemsName}
        onAdding={handleAdding}
      />
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('renders proper text', () => {
    const { getByText } = render(element);
    const message = getByText('You don\'t have any TESTS yet');

    expect(message).to.be.ok;
  });

  it('triggers onAdding once button clicked', () => {
    const { getByText } = render(element);
    const button = getByText('+');
    fireEvent.click(button);

    expect(handleAdding).to.have.been.calledOnce;
  });
});
