'use strict';

require('../../src/test-dom')();
var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var expect = require('chai').expect;

var HomeBlock = require('../../src/components/home-page/home-block');



describe('HomeBlock component', () => {

    var component;
    var renderedDOMElement;

    var mocks = {
        childText: 'test child text'
    };

    before(() => {
        component = TestUtils.renderIntoDocument(
            <HomeBlock>{ mocks.childText }</HomeBlock>
        );

        renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('renders parsed children', () => {
        expect(renderedDOMElement).to.have.property('textContent', mocks.childText);
    });
});
