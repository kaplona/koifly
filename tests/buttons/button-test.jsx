'use strict';

// Our fake DOM must be required before React to be used by React
require('../../src/test-dom')();

var React = require('react/addons');
var Button = require('../../src/components/common/buttons/button');

var Chai = require('chai');
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = Chai.expect;
Chai.use(sinonChai);



describe('Button component', () => {

    var TestUtils = React.addons.TestUtils;
    var Simulate = TestUtils.Simulate;

    var component;
    var renderedDOMElement;
    var handleClick;

    var defaults = {
        type: 'button',
        className: 'button'
    };

    var mocks = {
        buttonText: 'test button',
        buttonStyle: 'primary',
        className: 'section-button'
    };

    describe('Defaults and behavior testing (real DOM)', () => {
        before(() => {
            // Assign spy function to click-handler before each describe block
            // so to limit click tracking scope to the current block
            handleClick = Sinon.spy();

            component = TestUtils.renderIntoDocument(
                <Button
                    text={ mocks.buttonText }
                    buttonStyle={ mocks.buttonStyle }
                    onClick={ handleClick }
                    />
            );

            renderedDOMElement = React.findDOMNode(component);
        });

        it('renders an input element with proper text', () => {
            expect(renderedDOMElement).to.be.instanceof(window.HTMLInputElement);
            expect(renderedDOMElement).to.have.property('value', mocks.buttonText);
        });

        it('renders an input type button which is enabled', () => {
            expect(renderedDOMElement).to.have.property('type', defaults.type);
            expect(renderedDOMElement).to.have.property('disabled', false);
        });

        it('renders an element with proper default classes', () => {
            let classList = renderedDOMElement.classList;

            expect(classList).to.have.lengthOf(2);
            expect(classList[0]).to.equal(defaults.className);
            expect(classList[1]).to.equal(`x-${mocks.buttonStyle}`);
        });

        // For example purpose only I included the same tests using React TestUtils methods
        // it saves same space and test running time (which is not an issue for me... yet)
        it('renders an input element with proper default classes (React TestUtils)', () => {
            let button = TestUtils.findRenderedDOMComponentWithTag(component, 'input');

            expect(button).to.have.deep.property('props.className', `${defaults.className} x-${mocks.buttonStyle}`);
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


    describe('Disabled button, button type and class name tasting (real DOM)', () => {
        before(() => {
            handleClick =Sinon.spy();

            component = TestUtils.renderIntoDocument(
                <Button
                    text={ mocks.buttonText }
                    type='submit'
                    className={ mocks.className }
                    isEnabled={ false }
                    onClick={ handleClick }
                    />
            );

            renderedDOMElement = React.findDOMNode(component);
        });

        it('renders a disabled button', () => {
            expect(renderedDOMElement).to.have.property('disabled', true);
        });

        it('renders a submit button', () => {
            expect(renderedDOMElement).to.have.property('type', 'submit');
        });

        it('renders a button which css class we want', () => {
            let className = renderedDOMElement.className;

            expect(className).to.equal(mocks.className);
        });

        it('doesn\'t trigger onClick handler once clicked', () => {
            Simulate.click(renderedDOMElement);
            expect(handleClick).to.not.be.called;
        });
    });



    // For the sake of example purpose only I'm doing shallow rendering tests here
    // it saves even more code-space and test running time (which is not an issue for me... yet)
    describe('Testing with React shallow rendering', () => {

        var renderer = TestUtils.createRenderer();

        before(() => {
            handleClick = Sinon.spy();

            renderer.render(
                <Button
                    text={ mocks.buttonText }
                    buttonStyle={ mocks.buttonStyle }
                    onClick={ handleClick }
                    />
            );
        });

        it('renders an input element with proper classes', () => {
            let button = renderer.getRenderOutput();

            expect(button).to.have.property('type', 'input');
            expect(button).to.have.deep.property('props.className', `${defaults.className} x-${mocks.buttonStyle}`);
        });

        it('trigger onClick handler once clicked', () => {
            let button = renderer.getRenderOutput();

            expect(button).to.have.deep.property('props.onClick');

            button.props.onClick();
            expect(handleClick).to.have.been.calledOnce;
        });
    });
});
