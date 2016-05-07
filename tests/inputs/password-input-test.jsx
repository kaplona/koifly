/* eslint-disable no-unused-expressions */

'use strict';

require('../../src/test-dom')();
var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var Simulate = TestUtils.Simulate;

var Chai = require('chai');
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = Chai.expect;
Chai.use(sinonChai);

var Label = require('../../src/components/common/section/label');
var PasswordInput = require('../../src/components/common/inputs/password-input');
var ValidationError = require('../../src/components/common/section/validation-error');



describe('PasswordInput component', () => {

    var component;
    var renderedDOMElement;

    var defaults = {
        inputType: 'password',
        inputClassName: 'x-text',
        errorClassName: 'x-error'
    };

    var mocks = {
        initialInputValue: 'test input',
        nextInputValue: 'next tst value',
        labelText: 'Test label',
        errorMessage: 'test error message',
        inputName: 'testInput',
        handleInputChange: Sinon.spy(),
        handleInputFocus: Sinon.spy(),
        handleInputBlur: Sinon.spy()
    };


    describe('Defaults and behavior testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <PasswordInput
                    inputValue={ mocks.initialInputValue }
                    labelText={ mocks.labelText }
                    inputName={ mocks.inputName }
                    onChange={ mocks.handleInputChange }
                    onFocus={ mocks.handleInputFocus }
                    onBlur={ mocks.handleInputBlur }
                    />
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('renders label with proper text', () => {
            let label = TestUtils.findRenderedComponentWithType(component, Label);

            expect(label).to.have.deep.property('props.children', mocks.labelText);
        });

        it('renders input with proper value, type and classes', () => {
            let inputs = renderedDOMElement.getElementsByTagName('input');

            expect(inputs).to.have.lengthOf(1);
            expect(inputs[0]).to.have.property('value', mocks.initialInputValue);
            expect(inputs[0]).to.have.property('type', defaults.inputType);

            let className = inputs[0].className;

            expect(className).to.contain(defaults.inputClassName);
            expect(className).to.not.contain(defaults.errorClassName);
        });

        it('doesn\'t show error message if wasn\'t provided', () => {
            let errorMessages = TestUtils.scryRenderedComponentsWithType(component, ValidationError);

            expect(errorMessages).to.have.lengthOf(0);
        });

        it('triggers onChange function with proper parameters when changed', () => {
            let input = component.refs.input;
            input.value = mocks.nextInputValue;
            Simulate.change(input);

            expect(mocks.handleInputChange).to.have.been.calledOnce;
            expect(mocks.handleInputChange).to.have.been.calledWith(mocks.inputName, mocks.nextInputValue);
        });

        it('calls onFocus and onBlur functions', () => {
            let input = component.refs.input;
            Simulate.focus(input);
            Simulate.blur(input);

            expect(mocks.handleInputFocus).to.have.been.calledOnce;
            expect(mocks.handleInputBlur).to.have.been.calledOnce;
        });
    });


    describe('Error message testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <PasswordInput
                    inputValue={ mocks.initialInputValue }
                    labelText={ mocks.labelText }
                    errorMessage={ mocks.errorMessage }
                    inputName={ mocks.inputName }
                    onChange={ mocks.handleInputChange }
                    />
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('renders error message if provided', () => {
            let errorMessage = TestUtils.findRenderedComponentWithType(component, ValidationError);

            expect(errorMessage).to.have.deep.property('props.message', mocks.errorMessage);
        });

        it('renders input with error class if error message provided', () => {
            let inputClassName = renderedDOMElement.querySelector('input').className;

            expect(inputClassName).to.contain(defaults.errorClassName);
        });
    });
});
