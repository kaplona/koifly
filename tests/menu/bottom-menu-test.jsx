'use strict';

require('../../src/test-dom')();

var React = require('react/addons');
var BottomMenu = require('../../src/components/common/menu/bottom-menu');

var NavigationItem = require('../../src/components/common/menu/navigation-item');

var expect = require('chai').expect;



describe('BottomMenu component', () => {

    var TestUtils = React.addons.TestUtils;
    var Simulate = TestUtils.Simulate;

    var component;
    var renderedDOMElement;

    var defaults = {
        mobileClassName: 'x-mobile'
    };

    it('renders default class and doesn\'t highlight any navigation items', () => {
        component = TestUtils.renderIntoDocument(<BottomMenu />);
        let className = React.findDOMNode(component).className;
        let navigationItems = TestUtils.scryRenderedComponentsWithType(component, NavigationItem);

        expect(className).to.not.contain(defaults.mobileClassName);
        expect(navigationItems).to.have.lengthOf(4);
        expect(navigationItems[0]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[1]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[2]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[3]).to.have.deep.property('props.isActive', false);
    });

    it('renders mobile class if required', () => {
        component = TestUtils.renderIntoDocument(<BottomMenu isMobile={ true } />);
        let className = React.findDOMNode(component).className;

        expect(className).to.contain(defaults.mobileClassName);
    });

    it('highlights only flights navigation item', () => {
        component = TestUtils.renderIntoDocument(<BottomMenu isFlightView={ true } />);
        let navigationItems = TestUtils.scryRenderedComponentsWithType(component, NavigationItem);

        expect(navigationItems[0]).to.have.deep.property('props.isActive', true);
        expect(navigationItems[1]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[2]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[3]).to.have.deep.property('props.isActive', false);
    });

    it('highlights only sites navigation item', () => {
        component = TestUtils.renderIntoDocument(<BottomMenu isSiteView={ true } />);
        let navigationItems = TestUtils.scryRenderedComponentsWithType(component, NavigationItem);

        expect(navigationItems[0]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[1]).to.have.deep.property('props.isActive', true);
        expect(navigationItems[2]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[3]).to.have.deep.property('props.isActive', false);
    });

    it('highlights only gliders navigation item', () => {
        component = TestUtils.renderIntoDocument(<BottomMenu isGliderView={ true } />);
        let navigationItems = TestUtils.scryRenderedComponentsWithType(component, NavigationItem);

        expect(navigationItems[0]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[1]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[2]).to.have.deep.property('props.isActive', true);
        expect(navigationItems[3]).to.have.deep.property('props.isActive', false);
    });

    it('highlights only pilot navigation item', () => {
        component = TestUtils.renderIntoDocument(<BottomMenu isPilotView={ true } />);
        let navigationItems = TestUtils.scryRenderedComponentsWithType(component, NavigationItem);

        expect(navigationItems[0]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[1]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[2]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[3]).to.have.deep.property('props.isActive', true);
    });
});
