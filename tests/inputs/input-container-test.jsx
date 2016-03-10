'use strict';

require('../../src/test-dom')();
var React = require('react/addons');

var expect = require('chai').expect;

var InputContainer = require('../../src/components/common/inputs/input-container');



describe('InputContainer component', () => {

    var TestUtils = React.addons.TestUtils;

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
        let input = React.findDOMNode(component).querySelector('input');

        expect(input).to.have.property('value', mocks.inputText);
    });
});
