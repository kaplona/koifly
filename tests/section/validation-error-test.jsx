'use strict';

require('../../src/test-dom')();
var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var expect = require('chai').expect;

var ValidationError = require('../../src/components/common/section/validation-error');



describe('ValidationError component', () => {

    var component;
    var renderedDOMElement;

    var mocks = {
        errorMessage: 'test error message'
    };

    before(() => {
        component = TestUtils.renderIntoDocument(
            <ValidationError message={ mocks.errorMessage } />
        );

        renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('renders parsed props text', () => {
        expect(renderedDOMElement).to.have.property('textContent', mocks.errorMessage);
    });
});
