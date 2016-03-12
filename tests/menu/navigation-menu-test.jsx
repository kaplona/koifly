'use strict';

require('../../src/test-dom')();
var React = require('react/addons');
var expect = require('chai').expect;

var NavigationMenu = require('../../src/components/common/menu/navigation-menu');
var NavigationItem = require('../../src/components/common/menu/navigation-item');



describe('BottomMenu component', () => {

    var TestUtils = React.addons.TestUtils;
    var Simulate = TestUtils.Simulate;

    var component;

    var defaults = {
        mobileClassName: 'x-mobile'
    };

    it('renders default class and doesn\'t highlight any navigation items', () => {
        component = TestUtils.renderIntoDocument(<NavigationMenu />);
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
        component = TestUtils.renderIntoDocument(<NavigationMenu isMobile={ true } />);
        let className = React.findDOMNode(component).className;

        expect(className).to.contain(defaults.mobileClassName);
    });

    it('highlights only flights navigation item', () => {
        component = TestUtils.renderIntoDocument(<NavigationMenu isFlightView={ true } />);
        let navigationItems = TestUtils.scryRenderedComponentsWithType(component, NavigationItem);

        expect(navigationItems[0]).to.have.deep.property('props.isActive', true);
        expect(navigationItems[1]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[2]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[3]).to.have.deep.property('props.isActive', false);
    });

    it('highlights only sites navigation item', () => {
        component = TestUtils.renderIntoDocument(<NavigationMenu isSiteView={ true } />);
        let navigationItems = TestUtils.scryRenderedComponentsWithType(component, NavigationItem);

        expect(navigationItems[0]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[1]).to.have.deep.property('props.isActive', true);
        expect(navigationItems[2]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[3]).to.have.deep.property('props.isActive', false);
    });

    it('highlights only gliders navigation item', () => {
        component = TestUtils.renderIntoDocument(<NavigationMenu isGliderView={ true } />);
        let navigationItems = TestUtils.scryRenderedComponentsWithType(component, NavigationItem);

        expect(navigationItems[0]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[1]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[2]).to.have.deep.property('props.isActive', true);
        expect(navigationItems[3]).to.have.deep.property('props.isActive', false);
    });

    it('highlights only pilot navigation item', () => {
        component = TestUtils.renderIntoDocument(<NavigationMenu isPilotView={ true } />);
        let navigationItems = TestUtils.scryRenderedComponentsWithType(component, NavigationItem);

        expect(navigationItems[0]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[1]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[2]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[3]).to.have.deep.property('props.isActive', true);
    });
});
