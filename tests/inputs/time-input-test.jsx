'use strict';

require('../../src/test-dom')();

var React = require('react/addons');
var TimeInput = require('../../src/components/common/inputs/time-input');

var Label = require('../../src/components/common/section/label');
var ValidationError = require('../../src/components/common/section/validation-error');

var Chai = require('chai');
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = Chai.expect;
Chai.use(sinonChai);



describe('TimeInput component', () => {

    var TestUtils = React.addons.TestUtils;
    var Simulate = TestUtils.Simulate;

    var component;
    var renderedDOMElement;

    var defaults = {
        hoursInputName: 'hours',
        minutesInputName: 'minutes',
        inputPattern: '[0-9]*',
        inputClassName: 'x-number',
        errorClassName: 'x-error'
    };

    var mocks = {
        hoursValue: '4',
        minutesValue: '30',
        nextHoursValue: '2',
        nextMinutesValue: '45',
        labelText: 'Test label',
        errorMessage: 'general error message',
        errorMessageHours: 'hours error message',
        errorMessageMinutes: 'minutes error message',
        handleInputChange: Sinon.spy()
    };


    describe('Defaults and behavior testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <TimeInput
                    hours={ mocks.hoursValue }
                    minutes={ mocks.minutesValue }
                    labelText={ mocks.labelText }
                    onChange={ mocks.handleInputChange }
                    />
            );

            renderedDOMElement = React.findDOMNode(component);
        });

        it('renders label with proper text', () => {
            let label = TestUtils.findRenderedComponentWithType(component, Label);

            expect(label).to.have.deep.property('props.children', mocks.labelText);
        });

        it('renders inputs with proper value, classes and attributes', () => {
            let inputs = renderedDOMElement.getElementsByTagName('input');

            expect(inputs).to.have.lengthOf(2);
            expect(inputs[0]).to.have.property('value', mocks.hoursValue);
            expect(inputs[0]).to.have.property('pattern', defaults.inputPattern);
            expect(inputs[1]).to.have.property('value', mocks.minutesValue);
            expect(inputs[1]).to.have.property('pattern', defaults.inputPattern);

            let hoursClassName = inputs[0].className;
            let minutesClassName = inputs[1].className;

            expect(hoursClassName).to.contain(defaults.inputClassName);
            expect(hoursClassName).to.not.contain(defaults.errorClassName);
            expect(minutesClassName).to.contain(defaults.inputClassName);
            expect(minutesClassName).to.not.contain(defaults.errorClassName);
        });

        it('doesn\'t show error message if wasn\'t provided', () => {
            let errorMessages = TestUtils.scryRenderedComponentsWithType(component, ValidationError);

            expect(errorMessages).to.have.lengthOf(0);
        });

        it('triggers onChange function with proper parameters when changed', () => {
            let hoursInput = React.findDOMNode(component.refs[defaults.hoursInputName]);
            hoursInput.value = mocks.nextHoursValue;
            Simulate.change(hoursInput);

            expect(mocks.handleInputChange).to.have.been.calledOnce;
            expect(mocks.handleInputChange).to.have.been.calledWith(defaults.hoursInputName, mocks.nextHoursValue);

            let minutesInput = React.findDOMNode(component.refs[defaults.minutesInputName]);
            minutesInput.value = mocks.nextMinutesValue;
            Simulate.change(minutesInput);

            expect(mocks.handleInputChange).to.have.been.calledTwice;
            expect(mocks.handleInputChange).to.have.been.calledWith(defaults.minutesInputName, mocks.nextMinutesValue);
        });
    });


    describe('Error message testing', () => {
        it('renders error when general errorMessage provided', () => {
            component = TestUtils.renderIntoDocument(
                <TimeInput
                    hours={ mocks.hoursValue }
                    minutes={ mocks.minutesValue }
                    labelText={ mocks.labelText }
                    errorMessage={ mocks.errorMessage }
                    onChange={ mocks.handleInputChange }
                    />
            );

            let errorMessage = TestUtils.findRenderedComponentWithType(component, ValidationError);
            let highlightedInputs = React.findDOMNode(component).querySelectorAll(`input.${defaults.errorClassName}`);

            expect(errorMessage).to.have.deep.property('props.text', mocks.errorMessage);
            expect(highlightedInputs).to.have.lengthOf(2);
        });

        it('renders hours error when hours errorMessage provided', () => {
            component = TestUtils.renderIntoDocument(
                <TimeInput
                    hours={ mocks.hoursValue }
                    minutes={ mocks.minutesValue }
                    labelText={ mocks.labelText }
                    errorMessageHours={ mocks.errorMessageHours }
                    onChange={ mocks.handleInputChange }
                    />
            );

            let errorMessage = TestUtils.findRenderedComponentWithType(component, ValidationError);
            let hoursClassName = React.findDOMNode(component.refs[defaults.hoursInputName]).className;
            let minutesClassName = React.findDOMNode(component.refs[defaults.minutesInputName]).className;

            expect(errorMessage).to.have.deep.property('props.text', mocks.errorMessageHours);
            expect(hoursClassName).to.contain(defaults.errorClassName);
            expect(minutesClassName).to.not.contain(defaults.errorClassName);
        });

        it('renders minutes error when minutes errorMessage provided', () => {
            component = TestUtils.renderIntoDocument(
                <TimeInput
                    hours={ mocks.hoursValue }
                    minutes={ mocks.minutesValue }
                    labelText={ mocks.labelText }
                    errorMessageMinutes={ mocks.errorMessageMinutes }
                    onChange={ mocks.handleInputChange }
                    />
            );

            let errorMessage = TestUtils.findRenderedComponentWithType(component, ValidationError);
            let hoursClassName = React.findDOMNode(component.refs[defaults.hoursInputName]).className;
            let minutesClassName = React.findDOMNode(component.refs[defaults.minutesInputName]).className;

            expect(errorMessage).to.have.deep.property('props.text', mocks.errorMessageMinutes);
            expect(hoursClassName).to.not.contain(defaults.errorClassName);
            expect(minutesClassName).to.contain(defaults.errorClassName);
        });
    });
});
