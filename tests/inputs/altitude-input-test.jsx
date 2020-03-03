/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import Chai from 'chai';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import AltitudeInput from '../../src/components/common/inputs/altitude-input';


describe('AltitudeInput component', () => {
  let element;
  let handleInputChange;
  let handleInputFocus;
  let handleInputBlur;


  const defaults = {
    inputClassName: 'x-number',
    inputPattern: '[0-9]*',
    errorClassName: 'x-error',
    dropdownInputName: 'altitudeUnit'
  };

  const mocks = {
    initialInputValue: 1000,
    nextInputValue: 2000,
    labelText: 'Test label',
    selectedAltitudeUnit: 'feet',
    nextDropdownValue: 'meters',
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
        <AltitudeInput
          inputValue={mocks.initialInputValue}
          labelText={mocks.labelText}
          selectedAltitudeUnit={mocks.selectedAltitudeUnit}
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

    it('renders input with proper value, classes and attributes', () => {
      const { container } = render(element);
      const inputs = container.getElementsByTagName('input');

      expect(inputs).to.have.lengthOf(1);
      expect(inputs[0]).to.have.property('value', mocks.initialInputValue.toString());
      expect(inputs[0]).to.have.property('pattern', defaults.inputPattern);

      const className = inputs[0].className;

      expect(className).to.contain(defaults.inputClassName);
      expect(className).to.not.contain(defaults.errorClassName);
    });

    it('renders dropdown with proper selected altitude input', () => {
      const { container } = render(element);
      const dropdown = container.querySelector('select');

      expect(dropdown).to.have.property('value', mocks.selectedAltitudeUnit);
    });

    it('doesn\'t show error message if wasn\'t provided', () => {
      const { queryByText } = render(element);
      const errorMessages = queryByText(mocks.errorMessage);

      expect(errorMessages).to.not.be.ok;
    });

    it('triggers onChange function with proper parameters', () => {
      const { container } = render(element);
      const input = container.querySelector('input');
      fireEvent.change(input, { target: { value: mocks.nextInputValue } });

      expect(handleInputChange).to.have.been.calledOnce;
      expect(handleInputChange).to.have.been.calledWith(mocks.inputName, mocks.nextInputValue.toString());

      const dropdown = container.querySelector('select');
      fireEvent.change(dropdown, { target: { value: mocks.nextDropdownValue } });

      expect(handleInputChange).to.have.been.calledTwice;
      expect(handleInputChange).to.have.been.calledWith(defaults.dropdownInputName, mocks.nextDropdownValue);
    });

    it('calls onFocus and onBlur functions', () => {
      const { container } = render(element);
      const input = container.querySelector('input');
      fireEvent.focus(input);
      fireEvent.blur(input);

      expect(handleInputFocus).to.have.been.calledOnce;
      expect(handleInputBlur).to.have.been.calledOnce;

      const dropdown = container.querySelector('select');
      fireEvent.focus(dropdown);
      fireEvent.blur(dropdown);

      expect(handleInputFocus).to.have.been.calledTwice;
      expect(handleInputBlur).to.have.been.calledTwice;
    });
  });


  describe('Error message testing', () => {
    beforeEach(() => {
      element = (
        <AltitudeInput
          inputValue={mocks.initialInputValue}
          labelText={mocks.labelText}
          selectedAltitudeUnit={mocks.selectedAltitudeUnit}
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
