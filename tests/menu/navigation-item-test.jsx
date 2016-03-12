'use strict';

require('../../src/test-dom')();

var React = require('react/addons');
var NavigationItem = require('../../src/components/common/menu/navigation-item');

var Chai = require('chai');
var expect = Chai.expect;
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
Chai.use(sinonChai);



describe('NavigationItem component', () => {

    var TestUtils = React.addons.TestUtils;
    var Simulate = TestUtils.Simulate;

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

            renderedDOMElement = React.findDOMNode(component);
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

            let itemClassName = React.findDOMNode(component).className;

            expect(itemClassName).to.contain(defaults.activeClassName);
        });
    });
});
