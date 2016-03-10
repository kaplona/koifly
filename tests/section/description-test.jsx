'use strict';

require('../../src/test-dom')();
var React = require('react/addons');

var expect = require('chai').expect;

var Description = require('../../src/components/common/section/description');



describe('Description component', () => {

    var TestUtils = React.addons.TestUtils;

    var component;
    var renderedDOMElement;

    var mocks = {
        childText: 'test child text'
    };

    before(() => {
        component = TestUtils.renderIntoDocument(
            <Description>{ mocks.childText }</Description>
        );

        renderedDOMElement = React.findDOMNode(component);
    });

    it('renders parsed children', () => {
        expect(renderedDOMElement).to.have.property('textContent', mocks.childText);
    });
});
