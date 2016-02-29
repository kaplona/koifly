'use strict';

require('../../src/test-dom.js')();

var React = require('react/addons');
var BottomButtons = require('../../src/components/common/buttons/bottom-buttons.jsx');

var expect = require('chai').expect;



describe('BottomButtons component', function() {

    var TestUtils = React.addons.TestUtils;

    beforeEach(function() {
        // classes defined by the component
        this.containerClass = 'bottom-buttons';
        this.leftElementsClass = 'left-elements';
        this.rightElementClass = 'right-element';

        // props to parse
        this.leftElement1Text = 'left-1-element';
        this.leftElement2Text = 'left-2-element';
        this.rightElementText = 'right-element';
        this.leftElement1 = <div>{ this.leftElement1Text }</div>;
        this.leftElement2 = <div>{ this.leftElement2Text }</div>;
        this.rightElement = <div>{ this.rightElementText }</div>;

        this.component = TestUtils.renderIntoDocument(
            <BottomButtons
                leftElements={ [
                    this.leftElement1,
                    this.leftElement2
                ] }
                rightElement={ this.rightElement }
                />
        );

        this.getRenderedDomElement = () => {
            return React.findDOMNode(this.component);
        }
    });

    it('renders proper layout for parsed elements', function() {
        let parentClass = this.getRenderedDomElement().className;
        let children = this.getRenderedDomElement().children;

        expect(parentClass).to.equal(this.containerClass);
        expect(children).to.have.lengthOf(2);
        expect(children[0]).to.have.property('className', this.leftElementsClass);
        expect(children[1]).to.have.property('className', this.rightElementClass);
    });

    it('renders parsed Components in proper places', function() {
        var bottomButtons = this.getRenderedDomElement();

        let leftElements = bottomButtons.querySelector('.' + this.leftElementsClass).getElementsByTagName('div');
        expect(leftElements).to.have.lengthOf(4);
        // second and fourth div should be elements parsed as props,
        // the others are just wrappers
        expect(leftElements[1]).to.have.property('textContent', this.leftElement1Text);
        expect(leftElements[3]).to.have.property('textContent', this.leftElement2Text);

        let rightElements = bottomButtons.querySelector('.' + this.rightElementClass).getElementsByTagName('div');
        expect(rightElements).to.have.lengthOf(1);
        expect(rightElements[0]).to.have.property('textContent', this.rightElementText);
    });
});
