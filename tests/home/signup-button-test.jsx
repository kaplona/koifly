'use strict';

require('../../src/test-dom')();
var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var expect = require('chai').expect;

var SignupButton = require('../../src/components/home-page/signup-button');



describe('SignupButton component', () => {

    var component;
    var renderedDOMElement;

    var mocks = {
        buttonCaption: 'test button text'
    };

    before(() => {
        component = TestUtils.renderIntoDocument(
            <SignupButton caption={ mocks.buttonCaption } />
        );

        renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('renders button with proper capture', () => {
        expect(renderedDOMElement).to.be.instanceof(window.HTMLAnchorElement);
        expect(renderedDOMElement).to.have.property('textContent', mocks.buttonCaption);
    });
});
