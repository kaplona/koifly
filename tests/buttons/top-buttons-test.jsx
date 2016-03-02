'use strict';

require('../../src/test-dom')();

var React = require('react/addons');
var TopButtons = require('../../src/components/common/buttons/top-buttons');

var expect = require('chai').expect;



describe('TopButtons component', () => {

    var TestUtils = React.addons.TestUtils;

    var component;
    var renderedDomElement;

    var defaults = {
        containerClass: 'top-buttons',
        leftElementClass: 'left-element',
        middleElementClass: 'middle-element',
        rightElementClass: 'right-element'
    };

    var mocks = {
        leftElementText: 'left-element',
        middleElementText: 'middle-element',
        rightElementText: 'right-element'
    };

    before(() => {
        component = TestUtils.renderIntoDocument(
            <TopButtons
                leftElement={ <div>{ mocks.leftElementText }</div> }
                middleElement={ <div>{ mocks.middleElementText }</div> }
                rightElement={ <div>{ mocks.rightElementText }</div> }
                />
        );

        renderedDomElement = React.findDOMNode(component);
    });

    it('renders proper layout for parsed elements', () => {
        let parentClass = renderedDomElement.className;
        let children = renderedDomElement.children;

        expect(parentClass).to.equal(defaults.containerClass);
        expect(children).to.have.lengthOf(3);
        expect(children[0]).to.have.property('className', defaults.leftElementClass);
        expect(children[1]).to.have.property('className', defaults.middleElementClass);
        expect(children[2]).to.have.property('className', defaults.rightElementClass);
    });

    it('renders parsed Components in proper places', () => {
        let leftElement = renderedDomElement.querySelector(`.${defaults.leftElementClass} div`);
        expect(leftElement).to.have.property('textContent', mocks.leftElementText);

        let middleElement = renderedDomElement.querySelector(`.${defaults.middleElementClass} div`);
        expect(middleElement).to.have.property('textContent', mocks.middleElementText);

        let rightElement = renderedDomElement.querySelector(`.${defaults.rightElementClass} div`);
        expect(rightElement).to.have.property('textContent', mocks.rightElementText);
    });
});
