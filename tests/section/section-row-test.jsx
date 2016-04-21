'use strict';

require('../../src/test-dom')();
var React = require('react/addons');

var expect = require('chai').expect;

var SectionRow = require('../../src/components/common/section/section-row');



describe('SectionRow component', () => {

    var TestUtils = React.addons.TestUtils;

    var component;
    var renderedDOMElement;

    var defaults = {
        lastRowClass: 'x-last',
        desktopClass: 'x-desktop'
    };

    var mocks = {
        sectionRowText: 'test children text'
    };

    describe('Defaults testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <SectionRow>{ mocks.sectionRowText }</SectionRow>
            );

            renderedDOMElement = React.findDOMNode(component);
        });

        it('renders parsed children', () => {
            expect(renderedDOMElement).to.have.property('textContent', mocks.sectionRowText);
        });

        it('renders component with proper default classes', () => {
            let className = renderedDOMElement.className;

            expect(className).to.not.contain(defaults.lastRowClass);
            expect(className).to.not.contain(defaults.desktopClass);
        });
    });

    describe('Last row and desktop classes testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <SectionRow
                    isLast={ true }
                    isDesktopOnly={ true }
                    >
                    { mocks.sectionText }
                </SectionRow>
            );
        });

        it('renders component with proper classes', () => {
            let className = React.findDOMNode(component).className;

            expect(className).to.contain(defaults.lastRowClass);
            expect(className).to.contain(defaults.desktopClass);
        });
    });
});
