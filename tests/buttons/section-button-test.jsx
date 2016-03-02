'use strict';

require('../../src/test-dom')();

var React = require('react/addons');
var SectionButton = require('../../src/components/common/buttons/section-button');
var Button = require('../../src/components/common/buttons/button');

var expect = require('chai').expect;



describe('SectionButton component', () => {

    var TestUtils = React.addons.TestUtils;

    var component;

    var defaults ={
        className: 'section-button'
    };

    var mocks = {
        buttonText: 'test button',
        buttonType: 'submit',
        buttonStyle: 'primary',
        handleClick: () => {}
    };

    before(() => {
        component = TestUtils.renderIntoDocument(
            <SectionButton
                text={ mocks.buttonText }
                type={ mocks.buttonType }
                buttonStyle={ mocks.buttonStyle }
                onClick={ mocks.handleClick }
                />
        );
    });

    it('renders a Button component with proper props', () => {
        let button = TestUtils.findRenderedComponentWithType(component, Button);

        expect(button).to.have.deep.property('props.text', mocks.buttonText);
        expect(button).to.have.deep.property('props.type', mocks.buttonType);
        expect(button).to.have.deep.property('props.buttonStyle', mocks.buttonStyle);
        expect(button).to.have.deep.property('props.className', defaults.className);
        expect(button).to.have.deep.property('props.isEnabled', true);
        expect(button).to.have.deep.property('props.onClick', mocks.handleClick);
    });
});
