/* eslint-disable no-unused-expressions */

'use strict';

require('../../src/test-dom')();

var React = require('react/addons');
var RemarksInput = require('../../src/components/common/inputs/remarks-input');

var Label = require('../../src/components/common/section/label');
var ValidationError = require('../../src/components/common/section/validation-error');

var Chai = require('chai');
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = Chai.expect;
Chai.use(sinonChai);



describe('RemarksInput component', () => {

    var TestUtils = React.addons.TestUtils;
    var Simulate = TestUtils.Simulate;

    var component;
    var renderedDOMElement;

    var defaults = {
        errorClassName: 'x-error'
    };

    var mocks = {
        initialInputValue: 'test input',
        nextInputValue: 'next tst value',
        labelText: 'Test label',
        errorMessage: 'test error message',
        inputName: 'testInput',
        handleInputChange: Sinon.spy()
    };


    describe('Defaults and behavior testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <RemarksInput
                    inputValue={ mocks.initialInputValue }
                    labelText={ mocks.labelText }
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

        it('renders textarea with proper value', () => {
            let textareas = renderedDOMElement.getElementsByTagName('textarea');

            expect(textareas).to.have.lengthOf(1);
            expect(textareas[0]).to.have.property('value', mocks.initialInputValue);
        });

        it('doesn\'t show error message if wasn\'t provided', () => {
            let errorMessages = TestUtils.scryRenderedComponentsWithType(component, ValidationError);

            expect(errorMessages).to.have.lengthOf(0);
        });

        it('triggers onChange function with proper parameters when changed', () => {
            let textarea = React.findDOMNode(component.refs.textarea);
            textarea.value = mocks.nextInputValue;
            Simulate.change(textarea);

            expect(mocks.handleInputChange).to.have.been.calledOnce;
            expect(mocks.handleInputChange).to.have.been.calledWith(mocks.inputName, mocks.nextInputValue);
        });
    });


    describe('Error message testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <RemarksInput
                    inputValue={ mocks.initialInputValue }
                    labelText={ mocks.labelText }
                    errorMessage={ mocks.errorMessage }
                    inputName={ mocks.inputName }
                    onChange={ mocks.handleInputChange }
                    />
            );

            renderedDOMElement = React.findDOMNode(component);
        });

        it('renders error message if provided', () => {
            let errorMessage = TestUtils.findRenderedComponentWithType(component, ValidationError);

            expect(errorMessage).to.have.deep.property('props.message', mocks.errorMessage);
        });

        it('renders input with error classes if error message presents', () => {
            let inputClassName = renderedDOMElement.querySelector('textarea').className;

            expect(inputClassName).to.contain(defaults.errorClassName);
        });
    });
});
