'use strict';

require('../../src/test-dom')();
var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var expect = require('chai').expect;

var InputContainer = require('../../src/components/common/inputs/input-container');



describe('InputContainer component', () => {

    var component;

    var mocks = {
        inputText: 'test input text'
    };

    before(() => {
        component = TestUtils.renderIntoDocument(
            <InputContainer>
                <input
                    value={ mocks.inputText }
                    />
            </InputContainer>
        );
    });

    it('renders parsed children', () => {
        let input = ReactDOM.findDOMNode(component).querySelector('input');

        expect(input).to.have.property('value', mocks.inputText);
    });
});
