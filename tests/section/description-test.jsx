'use strict';

require('../../src/test-dom')();
var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var expect = require('chai').expect;

var Description = require('../../src/components/common/section/description');



describe('Description component', () => {

    var component;
    var renderedDOMElement;

    var mocks = {
        childText: 'test child text'
    };

    before(() => {
        component = TestUtils.renderIntoDocument(
            <Description>{ mocks.childText }</Description>
        );

        renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('renders parsed children', () => {
        expect(renderedDOMElement).to.have.property('textContent', mocks.childText);
    });
});
