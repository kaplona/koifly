'use strict';

require('../../src/test-dom')();
var React = require('react/addons');

var expect = require('chai').expect;

var BreadCrumbs = require('../../src/components/common/bread-crumbs');



describe('BreadCrumbs component', () => {

    var TestUtils = React.addons.TestUtils;

    var component;

    var mocks = {
        firstElementText: 'test first element text',
        secondElementText: 'test second element text',
        thirdElementText: 'test third element text'
    };


    before(() => {

        component = TestUtils.renderIntoDocument(
            <BreadCrumbs
                elements={ [
                    <div>{ mocks.firstElementText }</div>,
                    mocks.secondElementText,
                    mocks.thirdElementText
                ] }
                />
        );
    });

    it('renders proper layout and parsed element at proper places', () => {
        let crumbs = React.findDOMNode(component).children;
        let firstCrumbChildren = crumbs[0].children;
        let secondCrumbChildren = crumbs[1].children;
        let thirdCrumbChildren = crumbs[2].children;

        expect(crumbs).to.have.lengthOf(3);
        expect(firstCrumbChildren).to.have.lengthOf(2);
        expect(firstCrumbChildren[0]).to.have.property('textContent', mocks.firstElementText);
        expect(secondCrumbChildren).to.have.lengthOf(2);
        expect(secondCrumbChildren[0]).to.have.property('textContent', mocks.secondElementText);
        expect(thirdCrumbChildren).to.have.lengthOf(1);
        expect(thirdCrumbChildren[0]).to.have.property('textContent', mocks.thirdElementText);
    });
});
