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

var NavigationItem = require('../../src/components/common/menu/navigation-item');



describe('NavigationItem component', () => {

    var component;
    var renderedDOMElement;

    var defaults = {
        itemClassName: 'navigation-item-',
        activeClassName: 'x-active'
    };

    var mocks = {
        iconFileName: 'test-file.gif',
        itemLabel: 'test label',
        itemsNumber: 3,
        handleClick: Sinon.spy()
    };


    describe('Defaults testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <NavigationItem
                    iconFileName={ mocks.iconFileName }
                    label={ mocks.itemLabel }
                    itemsNumber={ mocks.itemsNumber }
                    onClick={ mocks.handleClick }
                    />
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('sets default state and renders notice with proper props', () => {
            let imgSrc = renderedDOMElement.querySelector('img');

            expect(renderedDOMElement).to.have.property('className', `${defaults.itemClassName}${mocks.itemsNumber}`);
            expect(renderedDOMElement).to.have.property('textContent', mocks.itemLabel);
            expect(imgSrc)
                .to.have.property('src')
                .that.contain(mocks.iconFileName);
        });

        it('triggers onClick event once clicked', () => {
            Simulate.click(renderedDOMElement);

            expect(mocks.handleClick).to.be.calledOnce;
        });
    });


    describe('isActive testing', () => {
        it('marks navigation item as active if isActive prop was passed', () => {
            component = TestUtils.renderIntoDocument(
                <NavigationItem
                    iconFileName={ mocks.iconFileName }
                    label={ mocks.itemLabel }
                    itemsNumber={ mocks.itemsNumber }
                    isActive={ true }
                    onClick={ mocks.handleClick }
                    />
            );

            let itemClassName = ReactDOM.findDOMNode(component).className;

            expect(itemClassName).to.contain(defaults.activeClassName);
        });
    });
});
