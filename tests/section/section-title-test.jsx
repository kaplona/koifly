'use strict';

require('../../src/test-dom')();
var React = require('react/addons');

var expect = require('chai').expect;

var SectionTitle = require('../../src/components/common/section/section-title');



describe('SectionTitle component', () => {

    var TestUtils = React.addons.TestUtils;

    var component;
    var renderedDOMElement;

    var defaults = {
        subtitleClass: 'x-subtitle'
    };

    var mocks = {
        titleText: 'test children text'
    };

    describe('Defaults testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <SectionTitle>{ mocks.titleText }</SectionTitle>
            );

            renderedDOMElement = React.findDOMNode(component);
        });

        it('renders parsed children', () => {
            expect(renderedDOMElement).to.have.property('textContent', mocks.titleText);
        });

        it('renders component with proper default classes', () => {
            let className = renderedDOMElement.className;

            expect(className).to.not.contain(defaults.subtitleClass);
        });
    });

    describe('Last row and desktop classes testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <SectionTitle
                    isSubtitle={ true }
                    >
                    { mocks.sectionText }
                </SectionTitle>
            );
        });

        it('renders component with proper classes', () => {
            let className = React.findDOMNode(component).className;

            expect(className).to.contain(defaults.subtitleClass);
        });
    });
});
