/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import Chai from 'chai';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import DateInput from '../../src/components/common/inputs/date-input';


describe('DateInput component', () => {
  let element;
  let handleInputChange;
  let handleInputFocus;
  let handleInputBlur;

  const defaults = {
    dateInputName: 'date',
    dateInputType: 'date',
    timeInputName: 'time',
    timeInputType: 'time',
    inputClassName: 'x-date',
    errorClassName: 'x-error'
  };

  const mocks = {
    initialDateValue: '2020-01-12',
    nextDateValue: '2020-02-29',
    nextTimeValue: '12:42:00',
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
        <DateInput
          inputDateValue={mocks.initialDateValue}
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

    it('renders inputs with proper type and classes', () => {
      const { container } = render(element);
      const inputs = container.getElementsByTagName('input');

      expect(inputs).to.have.lengthOf(2);
      expect(inputs[0]).to.have.property('type', defaults.dateInputType);
      expect(inputs[1]).to.have.property('type', defaults.timeInputType);

      const dateClassName = inputs[0].className;
      expect(dateClassName).to.contain(defaults.inputClassName);
      expect(dateClassName).to.not.contain(defaults.errorClassName);

      const timeClassName = inputs[0].className;
      expect(timeClassName).to.contain(defaults.inputClassName);
      expect(timeClassName).to.not.contain(defaults.errorClassName);
    });

    it('doesn\'t show error message if wasn\'t provided', () => {
      const { queryByText } = render(element);
      const errorMessages = queryByText(mocks.errorMessage);

      expect(errorMessages).to.not.be.ok;
    });

    it('triggers onChange function when date changed', () => {
      const { container } = render(element);
      const inputs = container.getElementsByTagName('input');
      const dateInput = inputs[0];
      fireEvent.change(dateInput, { target: { value: mocks.nextDateValue } });

      expect(handleInputChange).to.have.been.calledOnce;
      expect(handleInputChange).to.have.been.calledWith(defaults.dateInputName, mocks.nextDateValue);
    });

    it('triggers onChange function when time changed', () => {
      const { container } = render(element);
      const inputs = container.getElementsByTagName('input');
      const timeInput = inputs[1];
      fireEvent.change(timeInput, { target: { value: mocks.nextTimeValue } });

      expect(handleInputChange).to.have.been.calledOnce;
      expect(handleInputChange).to.have.been.calledWith(defaults.timeInputName, mocks.nextTimeValue);
    });

    it('calls onFocus and onBlur functions for date input', () => {
      const { container } = render(element);
      const inputs = container.getElementsByTagName('input');
      const dateInput = inputs[0];
      fireEvent.focus(dateInput);
      fireEvent.blur(dateInput);

      expect(handleInputFocus).to.have.been.calledOnce;
      expect(handleInputBlur).to.have.been.calledOnce;
    });

    it('calls onFocus and onBlur functions for time input', () => {
      const { container } = render(element);
      const inputs = container.getElementsByTagName('input');
      const timeInput = inputs[1];
      fireEvent.focus(timeInput);
      fireEvent.blur(timeInput);

      expect(handleInputFocus).to.have.been.calledOnce;
      expect(handleInputBlur).to.have.been.calledOnce;
    });
  });


  describe('Error message testing', () => {
    beforeEach(() => {
      element = (
        <DateInput
          inputDateValue={mocks.initialDateValue}
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
      const inputs = container.getElementsByTagName('input');

      expect(inputs[0].className).to.contain(defaults.errorClassName);
      expect(inputs[1].className).to.contain(defaults.errorClassName);
    });
  });
});
