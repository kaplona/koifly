/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import Chai from 'chai';
import shuffle from 'lodash.shuffle';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import Dropdown from '../../src/components/common/inputs/dropdown';


describe('Dropdown component', () => {
  let element;
  let handleSelectChange;
  let handleSelectFocus;
  let handleSelectBlur;

  const defaults = {
    emptyText: ''
  };

  const mocks = {
    selectedValue: 'test value',
    nextSelectedValue: 'next test value',
    emptyValue: 'empty value',
    inputName: 'testInput',
    className: 'test class',
    handleSelectChange: Sinon.spy(),
    handleSelectFocus: Sinon.spy(),
    handleSelectBlur: Sinon.spy()
  };

  const mockOptions = [
    { value: mocks.nextSelectedValue, text: 'c - third' },
    { value: 'another value', text: 'a - first' },
    { value: mocks.selectedValue, text: 'b - second' }
  ];

  beforeEach(() => {
    handleSelectChange = Sinon.spy();
    handleSelectFocus = Sinon.spy();
    handleSelectBlur = Sinon.spy();
  });

  afterEach(() => {
    cleanup();
  });


  describe('Defaults and behavior testing', () => {
    beforeEach(() => {
      element = (
        <Dropdown
          selectedValue={mocks.selectedValue}
          options={shuffle(mockOptions)}
          inputName={mocks.inputName}
          className={mocks.className}
          onChangeFunc={handleSelectChange}
          onFocus={handleSelectFocus}
          onBlur={handleSelectBlur}
        />
      );
    });

    it('renders select tag with proper selected value and options in alphabetic order', () => {
      const { container } = render(element);
      const select = container.querySelector('select');
      const options = container.getElementsByTagName('option');

      expect(select).to.have.property('value', mocks.selectedValue);
      expect(select).to.have.property('className', mocks.className);
      expect(options).to.have.lengthOf(mockOptions.length);

      expect(options[0]).to.have.property('value', mockOptions[1].value);
      expect(options[0]).to.have.property('textContent', mockOptions[1].text);
      expect(options[1]).to.have.property('value', mockOptions[2].value);
      expect(options[1]).to.have.property('textContent', mockOptions[2].text);
      expect(options[2]).to.have.property('value', mockOptions[0].value);
      expect(options[2]).to.have.property('textContent', mockOptions[0].text);
    });

    it('triggers onChange function with proper parameters when changed', () => {
      const { container } = render(element);
      const select = container.querySelector('select');
      fireEvent.change(select, { target: { value: mocks.nextSelectedValue } });

      expect(handleSelectChange).to.have.been.calledOnce;
      expect(handleSelectChange).to.have.been.calledWith(mocks.inputName, mocks.nextSelectedValue);
    });

    it('calls onFocus and onBlur functions', () => {
      const { container } = render(element);
      const select = container.querySelector('select');
      fireEvent.focus(select);
      fireEvent.blur(select);

      expect(handleSelectFocus).to.have.been.calledOnce;
      expect(handleSelectBlur).to.have.been.calledOnce;
    });
  });


  describe('Empty option testing', () => {
    beforeEach(() => {
      element = (
        <Dropdown
          selectedValue={mocks.selectedValue}
          options={mockOptions}
          emptyValue={mocks.emptyValue}
          inputName={mocks.inputName}
          onChangeFunc={handleSelectChange}
        />
      );
    });

    it('renders first option with empty text and value', () => {
      const { container } = render(element);
      const options = container.getElementsByTagName('option');

      expect(options).to.have.lengthOf(mockOptions.length + 1);
      expect(options[0]).to.have.property('value', mocks.emptyValue);
      expect(options[0]).to.have.property('textContent', defaults.emptyText);
    });
  });
});
