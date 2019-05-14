'use strict';

require('../../src/test-dom')();
const React = require('react');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;

const MobileButton = require('../../src/components/common/buttons/mobile-button');
const Button = require('../../src/components/common/buttons/button');


describe('MobileButton component', () => {

    let component;

    const mocks = {
        buttonText: 'test button',
        buttonType: 'submit',
        buttonStyle: 'primary',
        handleClick: () => {}
    };

    before(() => {
        component = TestUtils.renderIntoDocument(
            <MobileButton
                caption={mocks.buttonText}
                type={mocks.buttonType}
                buttonStyle={mocks.buttonStyle}
                onClick={mocks.handleClick}
            />
        );
    });

    it('renders a Button component with proper props', () => {
        const button = TestUtils.findRenderedComponentWithType(component, Button);

        expect(button).to.have.deep.property('props.caption', mocks.buttonText);
        expect(button).to.have.deep.property('props.type', mocks.buttonType);
        expect(button).to.have.deep.property('props.buttonStyle', mocks.buttonStyle);
        expect(button).to.have.deep.property('props.isMobile', true);
        expect(button).to.have.deep.property('props.isEnabled', true);
        expect(button).to.have.deep.property('props.onClick', mocks.handleClick);
    });
});
