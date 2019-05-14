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

const EmptyList = require('../../src/components/common/empty-list');


describe('EmptyList component', () => {

    let component;
    let renderedDOMElement;

    const defaults = {
        buttonClass: 'add-button'
    };

    const mocks = {
        itemsName: 'test type',
        handleAdding: Sinon.spy()
    };

    before(() => {
        component = TestUtils.renderIntoDocument(
            <EmptyList
                ofWhichItems={mocks.itemsName}
                onAdding={mocks.handleAdding}
            />
        );

        renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('renders proper text', () => {
        const children = renderedDOMElement.children;

        expect(children[0])
            .to.have.property('textContent')
            .that.contain(mocks.itemsName);
    });

    it('triggers onAdding once button clicked', () => {
        const button = renderedDOMElement.querySelector(`.${defaults.buttonClass}`);

        Simulate.click(button);

        expect(mocks.handleAdding).to.have.been.calledOnce;
    });
});
