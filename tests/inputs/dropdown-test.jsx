/* eslint-disable no-unused-expressions */

'use strict';

require('../../src/test-dom')();
var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var Simulate = TestUtils.Simulate;
var _ = require('lodash');

var Chai = require('chai');
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = Chai.expect;
Chai.use(sinonChai);

var Dropdown = require('../../src/components/common/inputs/dropdown');



describe('Dropdown component', () => {

    var component;
    var renderedDOMElement;

    var defaults = {
        emptyText: ''
    };

    var mocks = {
        selectedValue: 'test value',
        nextSelectedValue: 'next test value',
        emptyValue: 'empty value',
        inputName: 'testInput',
        className: 'test class',
        handleSelectChange: Sinon.spy(),
        handleSelectFocus: Sinon.spy(),
        handleSelectBlur: Sinon.spy()
    };

    var mockOptions = [
        { value: mocks.nextSelectedValue, text: 'a - first' },
        { value: 'another value', text: 'b - second' },
        { value: mocks.selectedValue, text: 'c - third' }
    ];


    describe('Defaults and behavior testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <Dropdown
                    selectedValue={ mocks.selectedValue }
                    options={ _.shuffle(mockOptions) }
                    inputName={ mocks.inputName }
                    className={ mocks.className }
                    onChangeFunc={ mocks.handleSelectChange }
                    onFocus={ mocks.handleSelectFocus }
                    onBlur={ mocks.handleSelectBlur }
                    />
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('renders select tag with proper selected value and options in alphabetic order', () => {
            let select = renderedDOMElement.querySelector('select');
            let options = renderedDOMElement.getElementsByTagName('option');

            expect(select).to.have.property('value', mocks.selectedValue);
            expect(select).to.have.property('className', mocks.className);
            expect(options).to.have.lengthOf(mockOptions.length);

            for (let i = 0; i < options.length; i++) {
                expect(options[i]).to.have.property('value', mockOptions[i].value);
                expect(options[i]).to.have.property('textContent', mockOptions[i].text);
            }
        });

        it('triggers onChange function with proper parameters when changed', () => {
            let select = renderedDOMElement.querySelector('select');
            select.value = mocks.nextSelectedValue;
            Simulate.change(select);

            expect(mocks.handleSelectChange).to.have.been.calledOnce;
            expect(mocks.handleSelectChange).to.have.been.calledWith(mocks.inputName, mocks.nextSelectedValue);
        });

        it('calls onFocus and onBlur functions', () => {
            let select = renderedDOMElement.querySelector('select');
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
                    selectedValue={ mocks.selectedValue }
                    options={ mockOptions }
                    emptyValue={ mocks.emptyValue }
                    inputName={ mocks.inputName }
                    onChangeFunc={ mocks.handleSelectChange }
                    />
            );
        });

        it('renders first option with empty text and value', () => {
            let options = ReactDOM.findDOMNode(component).getElementsByTagName('option');

            expect(options).to.have.lengthOf(mockOptions.length + 1);
            expect(options[0]).to.have.property('value', mocks.emptyValue);
            expect(options[0]).to.have.property('textContent', defaults.emptyText);
        });
    });
});
