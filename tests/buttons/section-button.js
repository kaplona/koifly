'use strict';

require('../../src/test-dom.js')();

var React = require('react/addons');
var SectionButton = require('../../src/components/common/buttons/section-button.jsx');
var Button = require('../../src/components/common/buttons/button.jsx');

var expect = require('chai').expect;



describe('SectionButton component', function() {

    var TestUtils = React.addons.TestUtils;

    beforeEach(function() {
        this.buttonText = 'test button';
        this.buttonType = 'submit';
        this.buttonStyle = 'primary';
        this.handleClick = function() {};

        this.component = TestUtils.renderIntoDocument(
            <SectionButton
                text={ this.buttonText }
                type={ this.buttonType }
                buttonStyle={ this.buttonStyle }
                onClick={ this.handleClick }
                />
        );
    });

    it('renders a Button component with proper props', function() {
        let button = TestUtils.findRenderedComponentWithType(this.component, Button);

        expect(button).to.have.deep.property('props.text', this.buttonText);
        expect(button).to.have.deep.property('props.type', this.buttonType);
        expect(button).to.have.deep.property('props.buttonStyle', this.buttonStyle);
        expect(button).to.have.deep.property('props.className', 'section-button');
        expect(button).to.have.deep.property('props.isEnabled', true);
        expect(button).to.have.deep.property('props.onClick', this.handleClick);
    });
});
