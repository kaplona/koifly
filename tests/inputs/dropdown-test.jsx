'use strict';

require('../../src/test-dom')();

var React = require('react/addons');
var Dropdown = require('../../src/components/common/inputs/dropdown');

var Chai = require('chai');
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = Chai.expect;
Chai.use(sinonChai);



describe('Dropdown component', () => {

    var TestUtils = React.addons.TestUtils;
    var Simulate = TestUtils.Simulate;

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
        handleSelectChange: Sinon.spy()
    };

    var mockOptions = [
        { value: mocks.selectedValue, text: 'c - third' },
        { value: mocks.nextSelectedValue, text: 'a - first' },
        { value: 'another value', text: 'b - second' }
    ];


    describe('Defaults and behavior testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <Dropdown
                    selectedValue={ mocks.selectedValue }
                    options={ mockOptions }
                    inputName={ mocks.inputName }
                    className={ mocks.className }
                    onChangeFunc={ mocks.handleSelectChange }
                    />
            );

            renderedDOMElement = React.findDOMNode(component);
        });

        it('renders select tag with proper selected value and options in alphabetic order', () => {
            let options = renderedDOMElement.getElementsByTagName('option');
            let optionOrder = [];
            let i = 0;
            while (optionOrder.length < mockOptions.length) {
                let minOptionText = null;
                let nextIndex = null;
                for (let j = 0; j < mockOptions.length; j++) {
                    if ((minOptionText === null || mockOptions[j].text.toUpperCase() < minOptionText) &&
                        optionOrder.indexOf(j) === -1
                    ) {
                        minOptionText = mockOptions[j].text.toUpperCase();
                        nextIndex = j;
                    }
                }
                optionOrder.push(nextIndex);
                i++;
            }

            expect(renderedDOMElement).to.have.property('value', mocks.selectedValue);
            expect(renderedDOMElement).to.have.property('className', mocks.className);
            expect(options).to.have.lengthOf(mockOptions.length);
            expect(options[0]).to.have.property('value', mockOptions[optionOrder[0]].value);
            expect(options[0]).to.have.property('textContent', mockOptions[optionOrder[0]].text);
            expect(options[1]).to.have.property('value', mockOptions[optionOrder[1]].value);
            expect(options[1]).to.have.property('textContent', mockOptions[optionOrder[1]].text);
            expect(options[2]).to.have.property('value', mockOptions[optionOrder[2]].value);
            expect(options[2]).to.have.property('textContent', mockOptions[optionOrder[2]].text);
        });

        it('triggers onChange function with proper parameters when changed', () => {
            renderedDOMElement.value = mocks.nextSelectedValue;
            Simulate.change(renderedDOMElement);

            expect(mocks.handleSelectChange).to.have.been.calledOnce;
            expect(mocks.handleSelectChange).to.have.been.calledWith(mocks.inputName, mocks.nextSelectedValue);
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
            let options = React.findDOMNode(component).getElementsByTagName('option');

            expect(options).to.have.lengthOf(mockOptions.length + 1);
            expect(options[0]).to.have.property('value', mocks.emptyValue);
            expect(options[0]).to.have.property('textContent', defaults.emptyText);
        });
    });
});
