'use strict';

require('../../src/test-dom')();

var React = require('react/addons');
var Notice = require('../../src/components/common/notice/notice');

var Chai = require('chai');
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = Chai.expect;
Chai.use(sinonChai);



describe('Notice component', () => {

    var TestUtils = React.addons.TestUtils;
    var Simulate = TestUtils.Simulate;

    var component;
    var renderedDOMElement;

    var defaults = {
        noticeClassName: 'notice',
        closeButtonClassName: 'close'
    };

    var mocks = {
        noticeText: 'test text',
        noticeType: 'success',
        buttonText: 'test button text',
        handleClick: Sinon.spy(),
        handleClose: Sinon.spy()
    };


    describe('Defaults testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <Notice text={ mocks.noticeText } />
            );

            renderedDOMElement = React.findDOMNode(component);
        });

        it('renders notice with proper text and default class', () => {
            expect(renderedDOMElement).to.have.property('className', defaults.noticeClassName);
            expect(renderedDOMElement).to.have.property('textContent', mocks.noticeText);
        });

        it('doesn\'t show buttons if onClick events weren\'t provided', () => {
            let inputs = renderedDOMElement.getElementsByTagName('input');
            let closeButton = renderedDOMElement.querySelector(`.${defaults.closeButtonClassName}`);

            expect(inputs).to.have.lengthOf(0);
            expect(closeButton).to.equal(null);
        });
    });


    describe('Behavior testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <Notice
                    text={ mocks.noticeText }
                    type={ mocks.noticeType }
                    buttonText={ mocks.buttonText }
                    onClick={ mocks.handleClick }
                    onClose={ mocks.handleClose }
                    />
            );

            renderedDOMElement = React.findDOMNode(component);
        });

        it('renders notice with proper class', () => {
            let className = renderedDOMElement.className;

            expect(className).to.contain(`x-${mocks.noticeType}`);
        });

        it('renders buttons and triggers onClick functions', () => {
            let actionButton = renderedDOMElement.querySelector('input');
            let closeButton = renderedDOMElement.querySelector(`.${defaults.closeButtonClassName}`);

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
                    text={ mocks.noticeText }
                    type={ mocks.noticeType }
                    buttonText={ mocks.buttonText }
                    onClick={ mocks.handleClick }
                    isButtonEnabled={ false }
                    />
            );

            renderedDOMElement = React.findDOMNode(component);
        });

        it('renders disabled buttons and doesn\'t call onClick functions', () => {
            let actionButton = renderedDOMElement.querySelector('input');

            expect(actionButton).to.have.property('disabled', true);

            Simulate.click(actionButton);

            expect(mocks.handleClick).to.have.not.been.calledOnce;
        });
    });
});
