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

var EmptyList = require('../../src/components/common/empty-list');



describe('EmptyList component', () => {

    var component;
    var renderedDOMElement;

    var defaults = {
        buttonClass: 'add-button'
    };

    var mocks = {
        itemsName: 'test type',
        handleAdding: Sinon.spy()
    };

    before(() => {
        component = TestUtils.renderIntoDocument(
            <EmptyList
                ofWhichItems={ mocks.itemsName }
                onAdding={ mocks.handleAdding }
                />
        );

        renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('renders proper text', () => {
        let children = renderedDOMElement.children;

        expect(children[0])
            .to.have.property('textContent')
            .that.contain(mocks.itemsName);
    });

    it('triggers onAdding once button clicked', () => {
        let button = renderedDOMElement.querySelector(`.${defaults.buttonClass}`);

        Simulate.click(button);

        expect(mocks.handleAdding).to.have.been.calledOnce;
    });
});
