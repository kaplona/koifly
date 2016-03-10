'use strict';

require('../../src/test-dom')();
var React = require('react/addons');
var _ = require('lodash');

var expect = require('chai').expect;

var ScreenShot = require('../../src/components/home-page/screen-shot');


describe('ScreenShot component', () => {

    var TestUtils = React.addons.TestUtils;

    var component;
    var renderedDOMElement;

    var defaults = {
        types: ['flights', 'sites', 'gliders']
    };

    var mocks = {
        randomType: null
    };

    before(() => {
        mocks.randomType = _.sample(defaults.types);

        component = TestUtils.renderIntoDocument(
            <ScreenShot type={ mocks.randomType } />
        );

        renderedDOMElement = React.findDOMNode(component);
    });

    it('renders header component and parsed children', () => {
        let children = renderedDOMElement.children;

        expect(children).to.have.lengthOf(2);
        expect(children[0])
            .to.have.property('className')
            .that.contain(mocks.randomType);
        expect(children[1])
            .to.have.property('className')
            .that.contain(mocks.randomType);
    });
});
