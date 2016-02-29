'use strict';

require('../../src/test-dom.js')();

var React = require('react/addons');
var TopButtons = require('../../src/components/common/buttons/top-buttons.jsx');

var expect = require('chai').expect;



describe('TopButtons component', function() {

    var TestUtils = React.addons.TestUtils;

    beforeEach(function() {
        // classes defined by the component
        this.containerClass = 'top-buttons';
        this.leftElementClass = 'left-element';
        this.middleElementClass = 'middle-element';
        this.rightElementClass = 'right-element';

        // props to parse
        this.leftElementText = 'left-element';
        this.middleElementText = 'middle-element';
        this.rightElementText = 'right-element';
        this.leftElement = <div>{ this.leftElementText }</div>;
        this.middleElement = <div>{ this.middleElementText }</div>;
        this.rightElement = <div>{ this.rightElementText }</div>;

        this.component = TestUtils.renderIntoDocument(
            <TopButtons
                leftElement={ this.leftElement }
                middleElement={ this.middleElement }
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
        expect(children).to.have.lengthOf(3);
        expect(children[0]).to.have.property('className', this.leftElementClass);
        expect(children[1]).to.have.property('className', this.middleElementClass);
        expect(children[2]).to.have.property('className', this.rightElementClass);
    });

    it('renders parsed Components in proper places', function() {
        var topButtons = this.getRenderedDomElement();

        let leftElements = topButtons.querySelector('.' + this.leftElementClass).getElementsByTagName('div');
        expect(leftElements).to.have.lengthOf(1);
        expect(leftElements[0]).to.have.property('textContent', this.leftElementText);

        let middleElements = topButtons.querySelector('.' + this.middleElementClass).getElementsByTagName('div');
        expect(middleElements).to.have.lengthOf(1);
        expect(middleElements[0]).to.have.property('textContent', this.middleElementText);

        let rightElements = topButtons.querySelector('.' + this.rightElementClass).getElementsByTagName('div');
        expect(rightElements).to.have.lengthOf(1);
        expect(rightElements[0]).to.have.property('textContent', this.rightElementText);
    });
});
