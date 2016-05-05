/* eslint-disable no-unused-expressions */

'use strict';

require('../../src/test-dom')();
var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var Simulate = TestUtils.Simulate;

var Chai = require('chai');
var expect = Chai.expect;
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
Chai.use(sinonChai);

var MobileTopMenu = require('../../src/components/common/menu/mobile-top-menu');



describe('MobileTopMenu component', () => {

    var component;

    var defaults = {
        headerClass: 'header',
        leftNavigationRef: 'left-navigation',
        rightNavigationRef: 'right-navigation'
    };

    var mocks = {
        headerText: 'test header text',
        leftButtonCaption: 'test left capture',
        rightButtonCaption: 'test right capture',
        handleLeftClick: Sinon.spy(),
        handleRightClick: Sinon.spy()
    };


    before(() => {
        component = TestUtils.renderIntoDocument(
            <MobileTopMenu
                header={ mocks.headerText }
                leftButtonCaption={ mocks.leftButtonCaption }
                rightButtonCaption={ mocks.rightButtonCaption }
                onLeftClick={ mocks.handleLeftClick }
                onRightClick={ mocks.handleRightClick }
                />
        );
    });

    it('renders proper layout', () => {
        let headerElement = ReactDOM.findDOMNode(component).querySelector('.header');
        let leftNavigationElement = component.refs[defaults.leftNavigationRef];
        let rightNavigationElement = component.refs[defaults.rightNavigationRef];

        expect(headerElement).to.have.property('textContent', mocks.headerText);
        expect(leftNavigationElement).to.have.property('textContent', mocks.leftButtonCaption);
        expect(rightNavigationElement).to.have.property('textContent', mocks.rightButtonCaption);
    });

    it('triggers right onClick event when navigation element clicked', () => {
        let leftNavigationElement = component.refs[defaults.leftNavigationRef];

        Simulate.click(leftNavigationElement);

        expect(mocks.handleLeftClick).to.be.calledOnce;
        expect(mocks.handleRightClick).to.not.be.called;

        let rightNavigationElement = component.refs[defaults.rightNavigationRef];

        Simulate.click(rightNavigationElement);

        expect(mocks.handleLeftClick).to.be.calledOnce; // to still be called just once
        expect(mocks.handleRightClick).to.be.calledOnce;
    });
});
