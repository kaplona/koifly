'use strict';

require('../../src/test-dom')();

var React = require('react/addons');
var DropdownInput = require('../../src/components/common/inputs/dropdown-input');

var Label = require('../../src/components/common/section/label');
var ValidationError = require('../../src/components/common/section/validation-error');
var Dropdown = require('../../src/components/common/inputs/dropdown');

var expect = require('chai').expect;



describe('DropdownInput component', () => {

    var TestUtils = React.addons.TestUtils;

    var component;
    var renderedDOMElement;

    var defaults = {
        emptyText: '',
        errorClassName: 'x-error'
    };

    var mocks = {
        selectedValue: 'test value',
        labelText: 'test text',
        options: [
            { value: '1', text: 'a' },
            { value: '2', text: 'b' },
            { value: '3', text: 'c' }
        ],
        emptyValue: 'empty value',
        errorMessage: 'test error message',
        inputName: 'testInput',
        handleSelectChange: () => {}
    };


    describe('Defaults and behavior testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <DropdownInput
                    selectedValue={ mocks.selectedValue }
                    options={ mocks.options }
                    labelText={ mocks.labelText }
                    emptyValue={ mocks.emptyValue }
                    inputName={ mocks.inputName }
                    onChangeFunc={ mocks.handleSelectChange }
                    />
            );
        });

        it('renders label with proper text', () => {
            let label = TestUtils.findRenderedComponentWithType(component, Label);

            expect(label).to.have.deep.property('props.children', mocks.labelText);
        });

        it('renders dropdown with proper props', () => {
            let dropdown = TestUtils.findRenderedComponentWithType(component, Dropdown);
            let className = React.findDOMNode(component).querySelector('select').className;

            expect(dropdown).to.have.deep.property('props.selectedValue', mocks.selectedValue);
            expect(dropdown).to.have.deep.property('props.options', mocks.options);
            expect(dropdown).to.have.deep.property('props.inputName', mocks.inputName);
            expect(dropdown).to.have.deep.property('props.emptyValue', mocks.emptyValue);
            expect(dropdown).to.have.deep.property('props.onChangeFunc', mocks.handleSelectChange);
            expect(className).to.not.contain(defaults.errorClassName);
        });

        it('doesn\'t show error message if wasn\'t provided', () => {
            let errorMessages = TestUtils.scryRenderedComponentsWithType(component, ValidationError);

            expect(errorMessages).to.have.lengthOf(0);
        });
    });


    describe('Error message testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <DropdownInput
                    selectedValue={ mocks.selectedValue }
                    options={ mocks.options }
                    labelText={ mocks.labelText }
                    inputName={ mocks.inputName }
                    errorMessage={ mocks.errorMessage }
                    onChangeFunc={ mocks.handleSelectChange }
                    />
            );

            renderedDOMElement = React.findDOMNode(component);
        });

        it('renders error message if provided', () => {
            let errorMessage = TestUtils.findRenderedComponentWithType(component, ValidationError);

            expect(errorMessage).to.have.deep.property('props.message', mocks.errorMessage);
        });

        it('renders select with error classes if error message presents', () => {
            let selectClassName = renderedDOMElement.querySelector('select').className;

            expect(selectClassName).to.contain(defaults.errorClassName);
        });
    });
});
