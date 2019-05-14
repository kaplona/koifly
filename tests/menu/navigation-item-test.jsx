/* eslint-disable no-unused-expressions */

'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const Simulate = TestUtils.Simulate;
const Chai = require('chai');
const expect = Chai.expect;
const Sinon = require('sinon');
const sinonChai = require('sinon-chai');
Chai.use(sinonChai);

const NavigationItem = require('../../src/components/common/menu/navigation-item');


describe('NavigationItem component', () => {

    let component;
    let renderedDOMElement;

    const defaults = {
        itemClassName: 'navigation-item-',
        activeClassName: 'x-active'
    };

    const mocks = {
        iconFileName: 'test-file.gif',
        itemLabel: 'test label',
        itemsNumber: 3,
        handleClick: Sinon.spy()
    };


    describe('Defaults testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <NavigationItem
                    iconFileName={mocks.iconFileName}
                    label={mocks.itemLabel}
                    itemsNumber={mocks.itemsNumber}
                    onClick={mocks.handleClick}
                />
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('sets default state and renders notice with proper props', () => {
            const imgSrc = renderedDOMElement.querySelector('img');

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
                    iconFileName={mocks.iconFileName}
                    label={mocks.itemLabel}
                    itemsNumber={mocks.itemsNumber}
                    isActive={true}
                    onClick={mocks.handleClick}
                />
            );

            const itemClassName = ReactDOM.findDOMNode(component).className;

            expect(itemClassName).to.contain(defaults.activeClassName);
        });
    });
});
