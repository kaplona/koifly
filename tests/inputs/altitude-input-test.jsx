'use strict';

require('../../src/test-dom')();

var React = require('react/addons');
var AltitudeInput = require('../../src/components/common/inputs/altitude-input');

// TODO mock this components since we check only props we pass to them
var Label = require('../../src/components/common/section/label');
var ValidationError = require('../../src/components/common/section/validation-error');
var Dropdown = require('../../src/components/common/inputs/dropdown');

var Chai = require('chai');
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = Chai.expect;
Chai.use(sinonChai);



describe('AltitudeInput component', () => {

    var TestUtils = React.addons.TestUtils;
    var Simulate = TestUtils.Simulate;

    var component;
    var renderedDOMElement;

    var defaults = {
        inputClassName: 'x-number',
        inputPattern: '[0-9]*',
        errorClassName: 'x-error',
        dropdownInputName: 'altitudeUnit'
    };

    // TODO random values
    var mocks = {
        initialInputValue: 'test input',
        nextInputValue: 'next tst value',
        labelText: 'Test label',
        selectedAltitudeUnit: 'feet',
        nextDropdownValue: 'meters',
        errorMessage: 'test error message',
        inputName:'testInput',
        handleInputChange: Sinon.spy()
    };


    describe('Defaults and behavior testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <AltitudeInput
                    inputValue={ mocks.initialInputValue }
                    labelText={ mocks.labelText }
                    selectedAltitudeUnit={ mocks.selectedAltitudeUnit }
                    inputName={ mocks.inputName }
                    onChange={ mocks.handleInputChange }
                    />
            );

            renderedDOMElement = React.findDOMNode(component);
        });

        it('renders label with proper text', () => {
            let label = TestUtils.findRenderedComponentWithType(component, Label);

            expect(label).to.have.deep.property('props.children', mocks.labelText);
        });

        it('renders input with proper value, classes and attributes', () => {
            let inputs = renderedDOMElement.getElementsByTagName('input');

            expect(inputs).to.have.lengthOf(1);
            expect(inputs[0]).to.have.property('value', mocks.initialInputValue);
            expect(inputs[0]).to.have.property('pattern', defaults.inputPattern);

            let className = inputs[0].className;

            expect(className).to.contain(defaults.inputClassName);
            expect(className).to.not.contain(defaults.errorClassName);
        });

        it('renders dropdown with proper props', () => {
            let dropdown = TestUtils.findRenderedComponentWithType(component, Dropdown);

            expect(dropdown).to.have.deep.property('props.selectedValue', mocks.selectedAltitudeUnit);
            expect(dropdown).to.have.deep.property('props.inputName', defaults.dropdownInputName);
            expect(dropdown).to.have.deep.property('props.onChangeFunc', component.handleUserInput);
        });

        it('doesn\'t show error message if wasn\'t provided', () => {
            let errorMessages = TestUtils.scryRenderedComponentsWithType(component, ValidationError);

            expect(errorMessages).to.have.lengthOf(0);
        });

        it('triggers onChange function with proper parameters', () => {
            let input = React.findDOMNode(component.refs[mocks.inputName]);
            input.value = mocks.nextInputValue;
            Simulate.change(input);

            expect(mocks.handleInputChange).to.have.been.calledOnce;
            expect(mocks.handleInputChange).to.have.been.calledWith(mocks.inputName, mocks.nextInputValue);

            let dropdown = renderedDOMElement.querySelector('select ');
            dropdown.value = mocks.nextDropdownValue;
            Simulate.change(dropdown);

            expect(mocks.handleInputChange).to.have.been.calledTwice;
            expect(mocks.handleInputChange).to.have.been.calledWith(defaults.dropdownInputName, mocks.nextDropdownValue);
        });
    });


    describe('Error message testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <AltitudeInput
                    inputValue={ mocks.initialInputValue }
                    labelText={ mocks.labelText }
                    selectedAltitudeUnit={ mocks.selectedAltitudeUnit }
                    errorMessage={ mocks.errorMessage }
                    inputName={ mocks.inputName }
                    onChange={ mocks.handleInputChange }
                    />
            );

            renderedDOMElement = React.findDOMNode(component);
        });

        it('renders error message if provided', () => {
            let errorMessage = TestUtils.findRenderedComponentWithType(component, ValidationError);

            expect(errorMessage).to.have.deep.property('props.text', mocks.errorMessage);
        });

        it('renders input with error classes if error message presents', () => {
            let inputClassName = renderedDOMElement.querySelector('input').className;

            expect(inputClassName).to.contain(defaults.errorClassName);
        });
    });
});
