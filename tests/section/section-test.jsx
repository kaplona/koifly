/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import Chai from 'chai';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import Section from '../../src/components/common/section/section';


describe('Section component', () => {
  let element;
  let handleClick;

  const defaults = {
    fullScreenClass: 'x-full-screen',
    editButtonText: 'Edit'
  };

  const mocks = {
    sectionText: 'test children text'
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
        <Section>{mocks.sectionText}</Section>
      );
    });

    it('renders parsed children', () => {
      const { getByText } = render(element);
      const section = getByText(mocks.sectionText);

      expect(section).to.be.ok;
    });

    it('doesn\'t render edit button and full-screen component by default', () => {
      const { container, queryByText } = render(element);
      const editButton = queryByText(defaults.editButtonText);
      const fullScreenSection = container.querySelector(`.${defaults.fullScreenClass}`);

      expect(editButton).to.not.be.ok;
      expect(fullScreenSection).to.not.be.ok;
    });
  });

  describe('Fullscreen and edit button testing', () => {
    beforeEach(() => {
      element = (
        <Section isFullScreen={true} onEditClick={handleClick}>
          {mocks.sectionText}
        </Section>
      );
    });

    it('renders  full-screen component', () => {
      const { container } = render(element);
      const fullScreenSection = container.querySelector(`.${defaults.fullScreenClass}`);

      expect(fullScreenSection).to.be.ok;
    });

    it('renders edit button and call proper onClick function', () => {
      const { getByText } = render(element);
      const editButton = getByText(defaults.editButtonText);
      fireEvent.click(editButton);

      expect(handleClick).to.have.been.calledOnce;
    });
  });
});
