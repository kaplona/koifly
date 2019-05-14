'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;

const ValueContainer = require('../../src/components/common/section/value-container');


describe('ValueContainer component', () => {

    let component;
    let renderedDOMElement;

    const mocks = {
        childText: 'test child text'
    };

    before(() => {
        component = TestUtils.renderIntoDocument(
            <ValueContainer>{mocks.childText}</ValueContainer>
        );

        renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('renders parsed props text', () => {
        expect(renderedDOMElement).to.have.property('textContent', mocks.childText);
    });
});
