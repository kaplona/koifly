'use strict';

require('../../src/test-dom')();
var React = require('react/addons');
var expect = require('chai').expect;

var FlightModel = require('../../src/models/flight');
var GliderModel = require('../../src/models/glider');
var SiteModel = require('../../src/models/site');
var PilotModel = require('../../src/models/pilot');

var NavigationMenu = require('../../src/components/common/menu/navigation-menu');
var NavigationItem = require('../../src/components/common/menu/navigation-item');



describe('BottomMenu component', () => {

    var TestUtils = React.addons.TestUtils;

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
        component = TestUtils.renderIntoDocument(<NavigationMenu currentView={ FlightModel.getModelKey() } />);
        let navigationItems = TestUtils.scryRenderedComponentsWithType(component, NavigationItem);

        expect(navigationItems[0]).to.have.deep.property('props.isActive', true);
        expect(navigationItems[1]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[2]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[3]).to.have.deep.property('props.isActive', false);
    });

    it('highlights only sites navigation item', () => {
        component = TestUtils.renderIntoDocument(<NavigationMenu currentView={ SiteModel.getModelKey() } />);
        let navigationItems = TestUtils.scryRenderedComponentsWithType(component, NavigationItem);

        expect(navigationItems[0]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[1]).to.have.deep.property('props.isActive', true);
        expect(navigationItems[2]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[3]).to.have.deep.property('props.isActive', false);
    });

    it('highlights only gliders navigation item', () => {
        component = TestUtils.renderIntoDocument(<NavigationMenu currentView={ GliderModel.getModelKey() } />);
        let navigationItems = TestUtils.scryRenderedComponentsWithType(component, NavigationItem);

        expect(navigationItems[0]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[1]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[2]).to.have.deep.property('props.isActive', true);
        expect(navigationItems[3]).to.have.deep.property('props.isActive', false);
    });

    it('highlights only pilot navigation item', () => {
        component = TestUtils.renderIntoDocument(<NavigationMenu currentView={ PilotModel.getModelKey() } />);
        let navigationItems = TestUtils.scryRenderedComponentsWithType(component, NavigationItem);

        expect(navigationItems[0]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[1]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[2]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[3]).to.have.deep.property('props.isActive', true);
    });
});
