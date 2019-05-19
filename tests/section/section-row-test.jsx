'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;

const SectionRow = require('../../src/components/common/section/section-row');


describe('SectionRow component', () => {

  let component;
  let renderedDOMElement;

  const defaults = {
    lastRowClass: 'x-last',
    desktopClass: 'x-desktop'
  };

  const mocks = {
    sectionRowText: 'test children text'
  };

  describe('Defaults testing', () => {
    before(() => {
      component = TestUtils.renderIntoDocument(
        <SectionRow>{mocks.sectionRowText}</SectionRow>
      );

      renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('renders parsed children', () => {
      expect(renderedDOMElement).to.have.property('textContent', mocks.sectionRowText);
    });

    it('renders component with proper default classes', () => {
      const className = renderedDOMElement.className;

      expect(className).to.not.contain(defaults.lastRowClass);
      expect(className).to.not.contain(defaults.desktopClass);
    });
  });

  describe('Last row and desktop classes testing', () => {
    before(() => {
      component = TestUtils.renderIntoDocument(
        <SectionRow isLast={true} isDesktopOnly={true}>
          {mocks.sectionText}
        </SectionRow>
      );
    });

    it('renders component with proper classes', () => {
      const className = ReactDOM.findDOMNode(component).className;

      expect(className).to.contain(defaults.lastRowClass);
      expect(className).to.contain(defaults.desktopClass);
    });
  });
});
