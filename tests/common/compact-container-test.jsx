'use strict';

require('../../src/test-dom')();
var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var expect = require('chai').expect;

var CompactContainer = require('../../src/components/common/compact-container');



describe('CompactContainer component', () => {

    var component;
    var renderedDOMElement;

    var mocks = {
        childText: 'test child text'
    };

    before(() => {
        component = TestUtils.renderIntoDocument(
            <CompactContainer>{ mocks.childText }</CompactContainer>
        );

        renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('renders parsed props text', () => {
        expect(renderedDOMElement).to.have.property('textContent', mocks.childText);
    });
});
