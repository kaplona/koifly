'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;
const FlightModel = require('../../src/models/flight');
const GliderModel = require('../../src/models/glider');
const SiteModel = require('../../src/models/site');
const PilotModel = require('../../src/models/pilot');

const NavigationMenu = require('../../src/components/common/menu/navigation-menu');
const NavigationItem = require('../../src/components/common/menu/navigation-item');


describe('BottomMenu component', () => {

    let component;

    const defaults = {
        mobileClassName: 'x-mobile'
    };

    it('renders default class and doesn\'t highlight any navigation items', () => {
        component = TestUtils.renderIntoDocument(<NavigationMenu />);
        const className = ReactDOM.findDOMNode(component).className;
        const navigationItems = TestUtils.scryRenderedComponentsWithType(component, NavigationItem);

        expect(className).to.not.contain(defaults.mobileClassName);
        expect(navigationItems).to.have.lengthOf(5);
        expect(navigationItems[0]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[1]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[2]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[3]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[4]).to.have.deep.property('props.isActive', false);
    });

    it('renders mobile class if required', () => {
        component = TestUtils.renderIntoDocument(<NavigationMenu isMobile={true} />);
        const className = ReactDOM.findDOMNode(component).className;

        expect(className).to.contain(defaults.mobileClassName);
    });

    it('highlights only flights navigation item', () => {
        component = TestUtils.renderIntoDocument(<NavigationMenu currentView={FlightModel.getModelKey()} />);
        const navigationItems = TestUtils.scryRenderedComponentsWithType(component, NavigationItem);

        expect(navigationItems[0]).to.have.deep.property('props.isActive', true);
        expect(navigationItems[1]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[2]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[3]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[4]).to.have.deep.property('props.isActive', false);
    });

    it('highlights only sites navigation item', () => {
        component = TestUtils.renderIntoDocument(<NavigationMenu currentView={SiteModel.getModelKey()} />);
        const navigationItems = TestUtils.scryRenderedComponentsWithType(component, NavigationItem);

        expect(navigationItems[0]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[1]).to.have.deep.property('props.isActive', true);
        expect(navigationItems[2]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[3]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[4]).to.have.deep.property('props.isActive', false);
    });

    it('highlights only gliders navigation item', () => {
        component = TestUtils.renderIntoDocument(<NavigationMenu currentView={GliderModel.getModelKey()} />);
        const navigationItems = TestUtils.scryRenderedComponentsWithType(component, NavigationItem);

        expect(navigationItems[0]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[1]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[2]).to.have.deep.property('props.isActive', true);
        expect(navigationItems[3]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[4]).to.have.deep.property('props.isActive', false);
    });

    it('highlights only stats navigation item', () => {
        component = TestUtils.renderIntoDocument(<NavigationMenu currentView='stats' />);
        const navigationItems = TestUtils.scryRenderedComponentsWithType(component, NavigationItem);

        expect(navigationItems[0]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[1]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[2]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[3]).to.have.deep.property('props.isActive', true);
        expect(navigationItems[4]).to.have.deep.property('props.isActive', false);
    });

    it('highlights only pilot navigation item', () => {
        component = TestUtils.renderIntoDocument(<NavigationMenu currentView={PilotModel.getModelKey()} />);
        const navigationItems = TestUtils.scryRenderedComponentsWithType(component, NavigationItem);

        expect(navigationItems[0]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[1]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[2]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[3]).to.have.deep.property('props.isActive', false);
        expect(navigationItems[4]).to.have.deep.property('props.isActive', true);
    });
});
