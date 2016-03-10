'use strict';

require('../../src/test-dom')();
var React = require('react/addons');

var expect = require('chai').expect;

var ValidationError = require('../../src/components/common/section/validation-error');



describe('ValidationError component', () => {

    var TestUtils = React.addons.TestUtils;

    var component;
    var renderedDOMElement;

    var mocks = {
        errorText: 'test error text'
    };

    before(() => {
        component = TestUtils.renderIntoDocument(
            <ValidationError
                text={ mocks.errorText }
                />
        );

        renderedDOMElement = React.findDOMNode(component);
    });

    it('renders parsed props text', () => {
        expect(renderedDOMElement).to.have.property('textContent', mocks.errorText);
    });
});
