/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import Chai from 'chai';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import TextInput from '../../src/components/common/inputs/text-input';


describe('TextInput component', () => {
  let element;
  let handleInputChange;
  let handleInputFocus;
  let handleInputBlur;

  const defaults = {
    textClassName: 'x-text',
    errorClassName: 'x-error'
  };

  const mocks = {
    initialInputValue: 'test value',
    nextInputValue: 'next test value',
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
        <TextInput
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

    it('renders input with proper value and classes', () => {
      const { container } = render(element);
      const inputs = container.getElementsByTagName('input');

      expect(inputs).to.have.lengthOf(1);
      expect(inputs[0]).to.have.property('value', mocks.initialInputValue);

      const className = inputs[0].className;

      expect(className).to.contain(defaults.textClassName);
      expect(className).to.not.contain(defaults.errorClassName);
    });

    it('doesn\'t show error message if wasn\'t provided', () => {
      const { queryByText } = render(element);
      const errorMessages = queryByText(mocks.errorMessage);

      expect(errorMessages).to.not.be.ok;
    });

    it('triggers onChange function with proper parameters when changed', () => {
      const { container } = render(element);
      const input = container.querySelector('input');
      fireEvent.change(input, { target: { value: mocks.nextInputValue } });

      expect(handleInputChange).to.have.been.calledOnce;
      expect(handleInputChange).to.have.been.calledWith(mocks.inputName, mocks.nextInputValue);
    });

    it('calls onFocus and onBlur functions', () => {
      const { container } = render(element);
      const input = container.querySelector('input');
      fireEvent.focus(input);
      fireEvent.blur(input);

      expect(handleInputFocus).to.have.been.calledOnce;
      expect(handleInputBlur).to.have.been.calledOnce;
    });
  });


  describe('Error message and number input type testing', () => {
    beforeEach(() => {
      element = (
        <TextInput
          inputValue={mocks.initialInputValue}
          labelText={mocks.labelText}
          isNumber={true}
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
      const input = container.querySelector('input');

      expect(input.className).to.contain(defaults.errorClassName);
    });
  });
});
