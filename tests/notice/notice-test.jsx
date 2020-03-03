/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import Chai from 'chai';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import Notice from '../../src/components/common/notice/notice';


describe('Notice component', () => {
  let element;
  let handleClick;
  let handleClose;

  const defaults = {
    noticeClassName: 'notice',
    paddedClassName: 'notice__padded-container',
    closeButtonClassName: 'close'
  };

  const mocks = {
    noticeText: 'test text',
    noticeType: 'success',
    buttonText: 'test button text'
  };

  before(() => {
    Sinon.stub(window, 'scrollTo');
  });

  after(() => {
    window.scrollTo.restore();
  });

  beforeEach(() => {
    handleClick = Sinon.spy();
    handleClose = Sinon.spy();
  });

  afterEach(() => {
    cleanup();
  });


  describe('Defaults testing', () => {
    beforeEach(() => {
      element = (
        <Notice text={mocks.noticeText} buttonText={mocks.buttonText}/>
      );
    });

    it('renders notice with proper text and default class', () => {
      const { getByText } = render(element);
      const notice = getByText(mocks.noticeText);

      expect(notice).to.be.ok;
      expect(notice.className).to.contain(defaults.noticeClassName);
    });

    it('doesn\'t show action button if onClick callback weren\'t provided', () => {
      const { queryByText } = render(element);
      const button = queryByText(mocks.buttonText);

      expect(button).to.not.be.ok;
    });

    it('doesn\'t show close button if onClose callback weren\'t provided', () => {
      const { queryByText } = render(element);
      const closeButton = queryByText('x');

      expect(closeButton).to.not.be.ok;
    });
  });


  describe('Behavior testing', () => {
    beforeEach(() => {
      element = (
        <Notice
          text={mocks.noticeText}
          type={mocks.noticeType}
          buttonText={mocks.buttonText}
          isPadded={true}
          onClick={handleClick}
          onClose={handleClose}
        />
      );
    });

    it('renders notice with padded container', () => {
      const { getByTestId } = render(element);
      const container = getByTestId('notice');

      expect(container.className).to.contain(defaults.paddedClassName);
    });

    it('renders notice with proper class', () => {
      const { getByText } = render(element);
      const notice = getByText(mocks.noticeText);

      expect(notice.className).to.contain(`x-${mocks.noticeType}`);
    });

    it('renders action button and calls onClick prop', () => {
      const { queryByText } = render(element);
      const button = queryByText(mocks.buttonText);
      fireEvent.click(button);

      expect(handleClick).to.have.been.calledOnce;
    });

    it('can be closed', () => {
      const { getByText } = render(element);
      const closeButton = getByText('x');
      fireEvent.click(closeButton);

      expect(handleClose).to.have.been.calledOnce;
    });
  });

  describe('Disabled button testing', () => {
    beforeEach(() => {
      element = (
        <Notice
          text={mocks.noticeText}
          type={mocks.noticeType}
          buttonText={mocks.buttonText}
          isButtonEnabled={false}
          onClick={handleClick}
        />
      );
    });

    it('renders disabled button', () => {
      const { getByText } = render(element);
      const actionButton = getByText(mocks.buttonText);

      expect(actionButton).to.have.property('disabled', true);

      fireEvent.click(actionButton);

      expect(handleClick).to.not.have.been.calledOnce;
    });
  });
});
