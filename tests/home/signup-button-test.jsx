'use strict';

require('../../src/test-dom')();
var React = require('react/addons');

var expect = require('chai').expect;

var SignupButton = require('../../src/components/home-page/signup-button');



describe('SignupButton component', () => {

    var TestUtils = React.addons.TestUtils;

    var component;
    var renderedDOMElement;

    var mocks = {
        buttonCaption: 'test button text'
    };

    before(() => {
        component = TestUtils.renderIntoDocument(
            <SignupButton caption={ mocks.buttonCaption } />
        );

        renderedDOMElement = React.findDOMNode(component);
    });

    it('renders button with proper capture', () => {
        expect(renderedDOMElement).to.be.instanceof(window.HTMLAnchorElement);
        expect(renderedDOMElement).to.have.property('textContent', mocks.buttonCaption);
    });
});
