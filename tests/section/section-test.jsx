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

var Section = require('../../src/components/common/section/section');
var Button = require('../../src/components/common/buttons/button');



describe('Section component', () => {

    var component;
    var renderedDOMElement;

    var defaults = {
        fullScreenClass: 'x-full-screen'
    };

    var mocks = {
        sectionText: 'test children text',
        handleClick: Sinon.spy()
    };

    describe('Defaults testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <Section>{ mocks.sectionText }</Section>
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('renders parsed children', () => {
            expect(renderedDOMElement).to.have.property('textContent', mocks.sectionText);
        });

        it('doesn\'t render edit button and full-screen component by default', () => {
            let editButton = TestUtils.scryRenderedComponentsWithType(component, Button);
            let className = renderedDOMElement.className;

            expect(editButton).to.have.lengthOf(0);
            expect(className).to.not.contain(defaults.fullScreenClass);
        });
    });

    describe('Fullscreen and edit button testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <Section
                    isFullScreen={ true }
                    onEditClick={ mocks.handleClick }
                    >
                    { mocks.sectionText }
                </Section>
            );
        });

        it('renders edit button and full-screen component', () => {
            let className = ReactDOM.findDOMNode(component).className;

            expect(className).to.contain(defaults.fullScreenClass);
        });

        it('renders edit button and call proper onClick function', () => {
            let editButton = TestUtils.findRenderedComponentWithType(component, Button);

            expect(editButton).to.have.deep.property('props.onClick', mocks.handleClick);

            let renderedDOMButton = ReactDOM.findDOMNode(editButton);

            Simulate.click(renderedDOMButton);

            expect(mocks.handleClick).to.have.been.calledOnece;
        });
    });
});
