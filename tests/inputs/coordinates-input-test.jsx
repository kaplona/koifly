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

var AppLink = require('../../src/components/common/app-link');
var CoordinatesInput = require('../../src/components/common/inputs/coordinates-input');
var Label = require('../../src/components/common/section/label');
var ValidationError = require('../../src/components/common/section/validation-error');



describe('CoordinatesInput component', () => {

    var component;
    var renderedDOMElement;

    var defaults = {
        className: 'x-text',
        errorClassName: 'x-error'
    };

    var mocks = {
        initialInputValue: 'test value',
        nextInputValue: 'next test value',
        labelText: 'Test label',
        errorMessage: 'test error message',
        inputName: 'coordinatesInput',
        handleInputChange: Sinon.spy(),
        handleMapShow: Sinon.spy(),
        handleInputFocus: Sinon.spy(),
        handleInputBlur: Sinon.spy()
    };


    describe('Defaults and behavior testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <CoordinatesInput
                    inputValue={ mocks.initialInputValue }
                    labelText={ mocks.labelText }
                    inputName={ mocks.inputName }
                    onChange={ mocks.handleInputChange }
                    onMapShow={ mocks.handleMapShow }
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

        it('renders input with proper value and classes', () => {
            let input = renderedDOMElement.querySelector('input');
            let inputClassName = input.className;

            expect(input).to.have.property('value', mocks.initialInputValue);
            expect(inputClassName).to.contain(defaults.className);
            expect(inputClassName).to.not.contain(defaults.errorClassName);
        });

        it('renders link to the map', () => {
            let mapLink = TestUtils.findRenderedComponentWithType(component, AppLink);

            expect(mapLink).to.have.deep.property('props.onClick', mocks.handleMapShow);
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
                <CoordinatesInput
                    inputValue={ mocks.initialInputValue }
                    labelText={ mocks.labelText }
                    inputName={ mocks.inputName }
                    errorMessage={ mocks.errorMessage }
                    onChange={ mocks.handleInputChange }
                    onMapShow={ mocks.handleMapShow }
                    />
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('renders error message if provided', () => {
            let errorMessage = TestUtils.findRenderedComponentWithType(component, ValidationError);

            expect(errorMessage).to.have.deep.property('props.message', mocks.errorMessage);
        });

        it('renders input with error className', () => {
            let input = renderedDOMElement.querySelector('input');
            let inputClassName = input.className;

            expect(inputClassName).to.contain(defaults.className);
            expect(inputClassName).to.contain(defaults.errorClassName);
        });
    });
});
