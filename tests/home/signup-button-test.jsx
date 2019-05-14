'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;

const SignupButton = require('../../src/components/home-page/signup-button');


describe('SignupButton component', () => {

    let component;
    let renderedDOMElement;

    const mocks = {
        buttonCaption: 'test button text'
    };

    before(() => {
        component = TestUtils.renderIntoDocument(
            <SignupButton caption={mocks.buttonCaption} />
        );

        renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('renders button with proper capture', () => {
        expect(renderedDOMElement).to.be.instanceof(window.HTMLAnchorElement);
        expect(renderedDOMElement).to.have.property('textContent', mocks.buttonCaption);
    });
});
