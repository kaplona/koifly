'use strict';

// Our fake DOM must be required before React for it to use it
require('../src/test-dom.js')();

var React = require('react/addons');
var Button = require('../src/components/common/buttons/button.jsx');

var Chai = require('chai');
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = Chai.expect;
Chai.use(sinonChai);



describe('Button component', function() {

    var TestUtils = React.addons.TestUtils;
    var Simulate = TestUtils.Simulate;

    describe('Real DOM testing approach', function() {
        beforeEach(function() {
            this.buttonText = 'test button';
            this.buttonStyle = 'primary';
            this.handleClick = Sinon.spy();
            this.component = TestUtils.renderIntoDocument(
                <Button
                    text={ this.buttonText }
                    buttonStyle={ this.buttonStyle }
                    onClick={ this.handleClick }
                    />
            );
            this.getRenderedDomElement = () => {
                return React.findDOMNode(this.component);
            }
        });

        it('renders an input element with proper text', function() {
            let button = this.getRenderedDomElement();

            // expect(button).to.have.property('tagName', 'INPUT');
            expect(button).to.be.an.instanceof(window.HTMLInputElement);
            expect(button).to.have.property('value', this.buttonText);
        });

        it('renders an input type button which is enabled', function() {
            let button = this.getRenderedDomElement();

            expect(button).to.have.property('type', 'button');
            expect(button).to.have.property('disabled', false);
        });

        it('renders an element with proper classes', function() {
            let classList = this.getRenderedDomElement().classList;

            expect(classList).to.have.lengthOf(2);
            expect(classList[0]).to.equal('button');
            expect(classList[1]).to.equal('x-' + this.buttonStyle);
        });

        // For example purpose only I included the same tests using React TestUtils methods
        // it saves same space and test running time (which is not an issue for me... yet)
        it('renders an input element with proper classes (React TestUtils)', function() {
            let button = TestUtils.findRenderedDOMComponentWithTag(this.component, 'input');

            expect(button).to.have.deep.property('props.className', 'button x-' + this.buttonStyle);
        });

        // Note: we can’t just issue an event on element with real DOM
        // since React is using synthetic events
        // to ensure cross-browser compatibility between implementations of the event system.
        // So, we are using Simulate technique of React TestUtils
        it('triggers onClick handler once clicked', function() {
            Simulate.click(this.getRenderedDomElement());

            expect(this.handleClick).to.have.been.calledOnce;
        });
    });


    describe('Real DOM testing approach (Disabled button)', function() {
        beforeEach(function() {
            this.buttonText = 'test button';
            this.handleClick = Sinon.spy();
            this.component = TestUtils.renderIntoDocument(
                <Button
                    text={ this.buttonText }
                    type='submit'
                    isEnabled={ false }
                    onClick={ this.handleClick }
                    />
            );
            this.getRenderedDomElement = () => {
                return React.findDOMNode(this.component);
            }
        });

        it('renders a submit button which is disabled', function() {
            let button = this.getRenderedDomElement();

            expect(button).to.have.property('type', 'submit');
            expect(button).to.have.property('disabled', true);
        });

        it('doesn\'t trigger onClick handler once clicked', function() {
            Simulate.click(this.getRenderedDomElement());
            expect(this.handleClick).to.not.be.called;
        });
    });



    // For the sake of example purpose only I'm doing shallow rendering tests here
    // it saves even more code-space and test running time (which is not an issue for me... yet)
    describe('Testing with React shallow rendering', function() {
        beforeEach(function() {
            this.renderer = TestUtils.createRenderer();
            this.handleClick = Sinon.spy();
            this.renderer.render(
                <Button
                    text='button test'
                    buttonStyle='primary'
                    onClick={ this.handleClick }
                    />
            );
        });

        it('renders an input element with proper classes', function() {
            let button = this.renderer.getRenderOutput();

            expect(button).to.have.property('type', 'input');
            expect(button).to.have.deep.property('props.className', 'button x-primary');
        });

        it('trigger onClick handler once clicked', function() {
            let button = this.renderer.getRenderOutput();

            expect(button).to.have.deep.property('props.onClick');

            button.props.onClick();
            expect(this.handleClick).to.have.been.calledOnce;
        });
    });
});
