'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;

const DropdownInput = require('../../src/components/common/inputs/dropdown-input');
const Label = require('../../src/components/common/section/label');
const ValidationError = require('../../src/components/common/section/validation-error');
const Dropdown = require('../../src/components/common/inputs/dropdown');


describe('DropdownInput component', () => {

    let component;
    let renderedDOMElement;

    const defaults = {
        emptyText: '',
        errorClassName: 'x-error'
    };

    const mocks = {
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
        handleSelectChange: () => {},
        handleSelectFocus: () => {},
        handleSelectBlur: () => {}
    };


    describe('Defaults and behavior testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <DropdownInput
                    selectedValue={mocks.selectedValue}
                    options={mocks.options}
                    labelText={mocks.labelText}
                    emptyValue={mocks.emptyValue}
                    inputName={mocks.inputName}
                    onChangeFunc={mocks.handleSelectChange}
                    onFocus={mocks.handleSelectFocus}
                    onBlur={mocks.handleSelectBlur}
                />
            );
        });

        it('renders label with proper text', () => {
            const label = TestUtils.findRenderedComponentWithType(component, Label);

            expect(label).to.have.deep.property('props.children', mocks.labelText);
        });

        it('renders dropdown with proper props', () => {
            const dropdown = TestUtils.findRenderedComponentWithType(component, Dropdown);
            const className = ReactDOM.findDOMNode(component).querySelector('select').className;

            expect(dropdown).to.have.deep.property('props.selectedValue', mocks.selectedValue);
            expect(dropdown).to.have.deep.property('props.options', mocks.options);
            expect(dropdown).to.have.deep.property('props.inputName', mocks.inputName);
            expect(dropdown).to.have.deep.property('props.emptyValue', mocks.emptyValue);
            expect(dropdown).to.have.deep.property('props.onChangeFunc', mocks.handleSelectChange);
            expect(dropdown).to.have.deep.property('props.onFocus', mocks.handleSelectFocus);
            expect(dropdown).to.have.deep.property('props.onBlur', mocks.handleSelectBlur);
            expect(className).to.not.contain(defaults.errorClassName);
        });

        it('doesn\'t show error message if wasn\'t provided', () => {
            const errorMessages = TestUtils.scryRenderedComponentsWithType(component, ValidationError);

            expect(errorMessages).to.have.lengthOf(0);
        });
    });


    describe('Error message testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <DropdownInput
                    selectedValue={mocks.selectedValue}
                    options={mocks.options}
                    labelText={mocks.labelText}
                    inputName={mocks.inputName}
                    errorMessage={mocks.errorMessage}
                    onChangeFunc={mocks.handleSelectChange}
                />
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('renders error message if provided', () => {
            const errorMessage = TestUtils.findRenderedComponentWithType(component, ValidationError);

            expect(errorMessage).to.have.deep.property('props.message', mocks.errorMessage);
        });

        it('renders select with error classes if error message presents', () => {
            const selectClassName = renderedDOMElement.querySelector('select').className;

            expect(selectClassName).to.contain(defaults.errorClassName);
        });
    });
});
