/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import Chai from 'chai';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import AirtimeInput from '../../src/components/common/inputs/airtime-input';


describe('TimeInput component', () => {
  let element;
  let handleInputChange;
  let handleInputFocus;
  let handleInputBlur;

  const defaults = {
    hoursInputName: 'hours',
    minutesInputName: 'minutes',
    inputPattern: '[0-9]*',
    inputClassName: 'x-number',
    errorClassName: 'x-error'
  };

  const mocks = {
    hoursValue: '4',
    minutesValue: '30',
    nextHoursValue: '2',
    nextMinutesValue: '45',
    labelText: 'Test label',
    errorMessage: 'test error message'
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
        <AirtimeInput
          hours={mocks.hoursValue}
          minutes={mocks.minutesValue}
          labelText={mocks.labelText}
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

    it('renders inputs with proper value, classes and attributes', () => {
      const { container } = render(element);
      const inputs = container.getElementsByTagName('input');

      expect(inputs).to.have.lengthOf(2);
      expect(inputs[0]).to.have.property('value', mocks.hoursValue);
      expect(inputs[0]).to.have.property('pattern', defaults.inputPattern);
      expect(inputs[1]).to.have.property('value', mocks.minutesValue);
      expect(inputs[1]).to.have.property('pattern', defaults.inputPattern);

      const hoursClassName = inputs[0].className;
      const minutesClassName = inputs[1].className;

      expect(hoursClassName).to.contain(defaults.inputClassName);
      expect(hoursClassName).to.not.contain(defaults.errorClassName);
      expect(minutesClassName).to.contain(defaults.inputClassName);
      expect(minutesClassName).to.not.contain(defaults.errorClassName);
    });

    it('doesn\'t show error message if wasn\'t provided', () => {
      const { queryByText } = render(element);
      const errorMessages = queryByText(mocks.errorMessage);

      expect(errorMessages).to.not.be.ok;
    });

    it('triggers onChange function with proper parameters when changed', () => {
      const { container } = render(element);
      const inputs = container.getElementsByTagName('input');

      const hoursInput = inputs[0];
      fireEvent.change(hoursInput, { target: { value: mocks.nextHoursValue } });

      expect(handleInputChange).to.have.been.calledOnce;
      expect(handleInputChange).to.have.been.calledWith(defaults.hoursInputName, mocks.nextHoursValue);

      const minutesInput = inputs[1];
      fireEvent.change(minutesInput, { target: { value: mocks.nextMinutesValue } });

      expect(handleInputChange).to.have.been.calledTwice;
      expect(handleInputChange).to.have.been.calledWith(defaults.minutesInputName, mocks.nextMinutesValue);
    });

    it('calls onFocus and onBlur functions', () => {
      const { container } = render(element);
      const inputs = container.getElementsByTagName('input');
      const hoursInput = inputs[0];
      fireEvent.focus(hoursInput);
      fireEvent.blur(hoursInput);

      expect(handleInputFocus).to.have.been.calledOnce;
      expect(handleInputBlur).to.have.been.calledOnce;

      const minutesInput = inputs[1];
      fireEvent.focus(minutesInput);
      fireEvent.blur(minutesInput);

      expect(handleInputFocus).to.have.been.calledTwice;
      expect(handleInputBlur).to.have.been.calledTwice;
    });
  });


  describe('Error message testing', () => {
    beforeEach(() => {
      element = (
        <AirtimeInput
          hours={mocks.hoursValue}
          minutes={mocks.minutesValue}
          labelText={mocks.labelText}
          errorMessage={mocks.errorMessage}
          onChange={handleInputChange}
        />
      );
    });

    it('renders error when general errorMessage provided', () => {
      const { queryByText } = render(element);
      const errorMessages = queryByText(mocks.errorMessage);

      expect(errorMessages).to.be.ok;
    });

    it('renders input with error classes if error message presents', () => {
      const { container } = render(element);
      const highlightedInputs = container.querySelectorAll(`input.${defaults.errorClassName}`);

      expect(highlightedInputs).to.have.lengthOf(2);
    });
  });
});
