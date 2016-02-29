'use strict';

// Our fake DOM must be required before React to be used by React
require('../../src/test-dom.js')();

var React = require('react/addons');
var Button = require('../../src/components/common/buttons/button.jsx');

var Chai = require('chai');
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = Chai.expect;
Chai.use(sinonChai);



describe('Button component', function() {

    var TestUtils = React.addons.TestUtils;
    var Simulate = TestUtils.Simulate;

    describe('Defaults and behavior testing (real DOM)', function() {
        beforeEach(function() {
            // default component props
            this.defaultType = 'button';
            this.defaultClass = 'button';

            // props to parse
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

            expect(button).to.be.an.instanceof(window.HTMLInputElement);
            expect(button).to.have.property('value', this.buttonText);
        });

        it('renders an input type button which is enabled', function() {
            let button = this.getRenderedDomElement();

            expect(button).to.have.property('type', this.defaultType);
            expect(button).to.have.property('disabled', false);
        });

        it('renders an element with proper default classes', function() {
            let classList = this.getRenderedDomElement().classList;

            expect(classList).to.have.lengthOf(2);
            expect(classList[0]).to.equal(this.defaultClass);
            expect(classList[1]).to.equal('x-' + this.buttonStyle);
        });

        // For example purpose only I included the same tests using React TestUtils methods
        // it saves same space and test running time (which is not an issue for me... yet)
        it('renders an input element with proper default classes (React TestUtils)', function() {
            let button = TestUtils.findRenderedDOMComponentWithTag(this.component, 'input');

            expect(button).to.have.deep.property('props.className', this.defaultClass + ' x-' + this.buttonStyle);
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


    describe('Disabled button, button type and class name tasting (real DOM)', function() {
        beforeEach(function() {
            this.buttonText = 'test button';
            this.className = 'section-button';
            this.handleClick = Sinon.spy();
            this.component = TestUtils.renderIntoDocument(
                <Button
                    text={ this.buttonText }
                    type='submit'
                    className={ this.className }
                    isEnabled={ false }
                    onClick={ this.handleClick }
                    />
            );
            this.getRenderedDomElement = () => {
                return React.findDOMNode(this.component);
            }
        });

        it('renders a disabled button', function() {
            let button = this.getRenderedDomElement();

            expect(button).to.have.property('disabled', true);
        });

        it('renders a submit button', function() {
            let button = this.getRenderedDomElement();

            expect(button).to.have.property('type', 'submit');
        });

        it('renders a button which css class we want', function() {
            let className = this.getRenderedDomElement().className;

            expect(className).to.equal(this.className);
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
