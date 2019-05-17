/* eslint-disable no-unused-expressions */

'use strict';

// Our fake DOM must be required before React to be used by React
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

const Button = require('../../src/components/common/buttons/button');


describe('Button component', () => {

    let component;
    let renderedDOMElement;
    let handleClick;

    const defaults = {
        type: 'button',
        className: 'button',
        desktopClassName: 'desktop-only',
        mobileClassName: 'mobile-button'
    };

    const mocks = {
        buttonCaption: 'test button',
        buttonStyle: 'primary'
    };

    describe('Defaults and behavior testing (real DOM)', () => {
        before(() => {
            // Assign spy function to click-handler before each describe block
            // so to limit click tracking scope to the current block
            handleClick = Sinon.spy();

            component = TestUtils.renderIntoDocument(
                <Button
                    caption={mocks.buttonCaption}
                    buttonStyle={mocks.buttonStyle}
                    onClick={handleClick}
                />
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('renders an input element with proper text', () => {
            expect(renderedDOMElement).to.be.instanceof(window.HTMLInputElement);
            expect(renderedDOMElement).to.have.property('value', mocks.buttonCaption);
        });

        it('renders an input type button which is enabled', () => {
            expect(renderedDOMElement).to.have.property('type', defaults.type);
            expect(renderedDOMElement).to.have.property('disabled', false);
        });

        it('renders an element with proper default classes', () => {
            const classList = renderedDOMElement.classList;

            expect(classList).to.have.lengthOf(3);
            expect(classList[0]).to.equal(defaults.className);
            expect(classList[1]).to.equal(defaults.desktopClassName);
            expect(classList[2]).to.equal(`x-${mocks.buttonStyle}`);
        });

        // For example purpose only I included the same tests using React TestUtils methods
        // it saves same space and test running time (which is not an issue for me... yet)
        it('renders an input element with proper default classes (React TestUtils)', () => {
            const button = TestUtils.findRenderedDOMComponentWithTag(component, 'input');
            const expectedClassName = `${defaults.className} ${defaults.desktopClassName} x-${mocks.buttonStyle}`;

            expect(button).to.have.property('className', expectedClassName);
        });

        // Note: we can’t just issue an event on element with real DOM
        // since React is using synthetic events
        // to ensure cross-browser compatibility between implementations of the event system.
        // So, we are using Simulate technique of React TestUtils
        it('triggers onClick handler once clicked', () => {
            Simulate.click(renderedDOMElement);

            expect(handleClick).to.have.been.calledOnce;
        });
    });


    describe('Disabled button, button type and class name testing (real DOM)', () => {
        before(() => {
            handleClick = Sinon.spy();

            component = TestUtils.renderIntoDocument(
                <Button
                    caption={mocks.buttonCaption}
                    type='submit'
                    isMobile={true}
                    isEnabled={false}
                    onClick={handleClick}
                />
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('renders a disabled button', () => {
            expect(renderedDOMElement).to.have.property('disabled', true);
        });

        it('renders a submit button', () => {
            expect(renderedDOMElement).to.have.property('type', 'submit');
        });

        it('renders a button which css class we want', () => {
            const className = renderedDOMElement.className;

            expect(className).to.equal(defaults.mobileClassName);
        });

        it('doesn\'t trigger onClick handler once clicked', () => {
            Simulate.click(renderedDOMElement);
            expect(handleClick).to.not.be.called;
        });
    });


    // For the sake of example purpose only I'm doing shallow rendering tests here
    // it saves even more code-space and test running time (which is not an issue for me... yet)
    describe('Testing with React shallow rendering', () => {

        const renderer = TestUtils.createRenderer();

        before(() => {
            handleClick = Sinon.spy();

            renderer.render(
                <Button
                    caption={mocks.buttonCaption}
                    buttonStyle={mocks.buttonStyle}
                    onClick={handleClick}
                />
            );
        });

        it('renders an input element with proper classes', () => {
            const button = renderer.getRenderOutput();
            const expectedClassName = `${defaults.className} ${defaults.desktopClassName} x-${mocks.buttonStyle}`;

            expect(button).to.have.property('type', 'input');
            expect(button).to.have.deep.property('props.className', expectedClassName);
        });

        it('trigger onClick handler once clicked', () => {
            const button = renderer.getRenderOutput();

            expect(button).to.have.deep.property('props.onClick');

            button.props.onClick();
            expect(handleClick).to.have.been.calledOnce;
        });
    });
});
