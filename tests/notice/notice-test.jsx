/* eslint-disable no-unused-expressions */

'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const Simulate = TestUtils.Simulate;
const Chai = require('chai');
const Sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = Chai.expect;
Chai.use(sinonChai);

const Notice = require('../../src/components/common/notice/notice');


describe('Notice component', () => {

    let component;
    let renderedDOMElement;

    const defaults = {
        noticeClassName: 'notice',
        closeButtonClassName: 'close'
    };

    const mocks = {
        noticeText: 'test text',
        noticeType: 'success',
        buttonText: 'test button text',
        handleClick: Sinon.spy(),
        handleClose: Sinon.spy()
    };


    describe('Defaults testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <Notice text={mocks.noticeText} />
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('renders notice with proper text and default class', () => {
            expect(renderedDOMElement).to.have.property('className', defaults.noticeClassName);
            expect(renderedDOMElement).to.have.property('textContent', mocks.noticeText);
        });

        it('doesn\'t show buttons if onClick events weren\'t provided', () => {
            const inputs = renderedDOMElement.getElementsByTagName('input');
            const closeButton = renderedDOMElement.querySelector(`.${defaults.closeButtonClassName}`);

            expect(inputs).to.have.lengthOf(0);
            expect(closeButton).to.equal(null);
        });
    });


    describe('Behavior testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <Notice
                    text={mocks.noticeText}
                    type={mocks.noticeType}
                    buttonText={mocks.buttonText}
                    onClick={mocks.handleClick}
                    onClose={mocks.handleClose}
                />
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('renders notice with proper class', () => {
            const className = renderedDOMElement.className;

            expect(className).to.contain(`x-${mocks.noticeType}`);
        });

        it('renders buttons and triggers onClick functions', () => {
            const actionButton = renderedDOMElement.querySelector('input');
            const closeButton = renderedDOMElement.querySelector(`.${defaults.closeButtonClassName}`);

            expect(actionButton).to.have.property('value', mocks.buttonText);
            expect(closeButton).to.be.ok;

            Simulate.click(actionButton);
            Simulate.click(closeButton);

            expect(mocks.handleClick).to.have.been.calledOnce;
            expect(mocks.handleClose).to.have.been.calledOnce;
        });
    });

    describe('Enabled button testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <Notice
                    text={mocks.noticeText}
                    type={mocks.noticeType}
                    buttonText={mocks.buttonText}
                    onClick={mocks.handleClick}
                    isButtonEnabled={false}
                />
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('renders disabled buttons and doesn\'t call onClick functions', () => {
            const actionButton = renderedDOMElement.querySelector('input');

            expect(actionButton).to.have.property('disabled', true);

            Simulate.click(actionButton);

            expect(mocks.handleClick).to.have.been.calledOnce;
        });
    });
});
