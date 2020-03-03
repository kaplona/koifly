/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import Chai from 'chai';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import RemarksInput from '../../src/components/common/inputs/remarks-input';


describe('RemarksInput component', () => {
  let element;
  let handleInputChange;
  let handleInputFocus;
  let handleInputBlur;

  const defaults = {
    errorClassName: 'x-error'
  };

  const mocks = {
    initialInputValue: 'test input',
    nextInputValue: 'next tst value',
    labelText: 'Test label',
    errorMessage: 'test error message',
    inputName: 'testInput'
  };

  beforeEach(() => {
    handleInputChange = Sinon.spy();
    handleInputFocus = Sinon.spy();
    handleInputBlur = Sinon.spy();
  });

  afterEach(() => {
    cleanup();
  });


  describe('Defaults and behavior testing', () => {
    beforeEach(() => {
      element = (
        <RemarksInput
          inputValue={mocks.initialInputValue}
          labelText={mocks.labelText}
          inputName={mocks.inputName}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      );
    });

    it('renders label with proper text', () => {
      const { getByText } = render(element);
      const label = getByText(mocks.labelText);

      expect(label).to.be.ok;
    });

    it('renders textarea with proper value', () => {
      const { container } = render(element);
      const textareas = container.getElementsByTagName('textarea');

      expect(textareas).to.have.lengthOf(1);
      expect(textareas[0]).to.have.property('value', mocks.initialInputValue);
    });

    it('doesn\'t show error message if wasn\'t provided', () => {
      const { queryByText } = render(element);
      const errorMessages = queryByText(mocks.errorMessage);

      expect(errorMessages).to.not.be.ok;
    });

    it('triggers onChange function with proper parameters when changed', () => {
      const { container } = render(element);
      const textarea = container.querySelector('textarea');
      fireEvent.change(textarea, { target: { value: mocks.nextInputValue } });

      expect(handleInputChange).to.have.been.calledOnce;
      expect(handleInputChange).to.have.been.calledWith(mocks.inputName, mocks.nextInputValue);
    });

    it('calls onFocus and onBlur functions', () => {
      const { container } = render(element);
      const textarea = container.querySelector('textarea');
      fireEvent.focus(textarea);
      fireEvent.blur(textarea);

      expect(handleInputFocus).to.have.been.calledOnce;
      expect(handleInputBlur).to.have.been.calledOnce;
    });
  });


  describe('Error message testing', () => {
    beforeEach(() => {
      element = (
        <RemarksInput
          inputValue={mocks.initialInputValue}
          labelText={mocks.labelText}
          errorMessage={mocks.errorMessage}
          inputName={mocks.inputName}
          onChange={handleInputChange}
        />
      );
    });

    it('renders error message if provided', () => {
      const { queryByText } = render(element);
      const errorMessages = queryByText(mocks.errorMessage);

      expect(errorMessages).to.be.ok;
    });

    it('renders input with error classes if error message presents', () => {
      const { container } = render(element);
      const textarea = container.querySelector('textarea');

      expect(textarea.className).to.contain(defaults.errorClassName);
    });
  });
});
