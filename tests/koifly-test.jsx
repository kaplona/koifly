/* eslint-disable no-unused-expressions */

'use strict';

require('../src/test-dom')();
var React = require('react/addons');

var expect = require('chai').expect;

var Koifly = require('../src/components/koifly');
var Header = require('../src/components/common/menu/header');



describe('Koifly component', () => {

    var TestUtils = React.addons.TestUtils;

    var component;
    var renderedDOMElement;

    var mocks = {
        childText: 'test child text',
        childClassName: 'childClass'
    };

    before(() => {
        component = TestUtils.renderIntoDocument(
            <Koifly>
                <div className={ mocks.childClassName } >{ mocks.childText }</div>
            </Koifly>
        );

        renderedDOMElement = React.findDOMNode(component);
    });

    it('renders header component and parsed children', () => {
        let header = TestUtils.findRenderedComponentWithType(component, Header);
        let children = renderedDOMElement.querySelector(`.${mocks.childClassName}`);

        expect(header).to.be.ok;
        expect(children).to.have.property('textContent', mocks.childText);
    });
});
