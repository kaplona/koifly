/* eslint-disable no-unused-expressions */

'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const Simulate = TestUtils.Simulate;
const _ = require('lodash');
const Chai = require('chai');
const Sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = Chai.expect;
Chai.use(sinonChai);

const Dropdown = require('../../src/components/common/inputs/dropdown');


describe('Dropdown component', () => {

  let component;
  let renderedDOMElement;

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
    { value: mocks.nextSelectedValue, text: 'a - first' },
    { value: 'another value', text: 'b - second' },
    { value: mocks.selectedValue, text: 'c - third' }
  ];


  describe('Defaults and behavior testing', () => {
    before(() => {
      component = TestUtils.renderIntoDocument(
        <Dropdown
          selectedValue={mocks.selectedValue}
          options={_.shuffle(mockOptions)}
          inputName={mocks.inputName}
          className={mocks.className}
          onChangeFunc={mocks.handleSelectChange}
          onFocus={mocks.handleSelectFocus}
          onBlur={mocks.handleSelectBlur}
        />
      );

      renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('renders select tag with proper selected value and options in alphabetic order', () => {
      const select = renderedDOMElement.querySelector('select');
      const options = renderedDOMElement.getElementsByTagName('option');

      expect(select).to.have.property('value', mocks.selectedValue);
      expect(select).to.have.property('className', mocks.className);
      expect(options).to.have.lengthOf(mockOptions.length);

      for (let i = 0; i < options.length; i++) {
        expect(options[i]).to.have.property('value', mockOptions[i].value);
        expect(options[i]).to.have.property('textContent', mockOptions[i].text);
      }
    });

    it('triggers onChange function with proper parameters when changed', () => {
      const select = renderedDOMElement.querySelector('select');
      select.value = mocks.nextSelectedValue;
      Simulate.change(select);

      expect(mocks.handleSelectChange).to.have.been.calledOnce;
      expect(mocks.handleSelectChange).to.have.been.calledWith(mocks.inputName, mocks.nextSelectedValue);
    });

    it('calls onFocus and onBlur functions', () => {
      const select = renderedDOMElement.querySelector('select');
      Simulate.focus(select);
      Simulate.blur(select);

      expect(mocks.handleSelectFocus).to.have.been.calledOnce;
      expect(mocks.handleSelectBlur).to.have.been.calledOnce;
    });
  });


  describe('Empty option testing', () => {
    before(() => {
      component = TestUtils.renderIntoDocument(
        <Dropdown
          selectedValue={mocks.selectedValue}
          options={mockOptions}
          emptyValue={mocks.emptyValue}
          inputName={mocks.inputName}
          onChangeFunc={mocks.handleSelectChange}
        />
      );
    });

    it('renders first option with empty text and value', () => {
      const options = ReactDOM.findDOMNode(component).getElementsByTagName('option');

      expect(options).to.have.lengthOf(mockOptions.length + 1);
      expect(options[0]).to.have.property('value', mocks.emptyValue);
      expect(options[0]).to.have.property('textContent', defaults.emptyText);
    });
  });
});
