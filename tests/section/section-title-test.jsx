'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;

const SectionTitle = require('../../src/components/common/section/section-title');


describe('SectionTitle component', () => {

  let component;
  let renderedDOMElement;

  const defaults = {
    subtitleClass: 'x-subtitle'
  };

  const mocks = {
    titleText: 'test children text'
  };

  describe('Defaults testing', () => {
    before(() => {
      component = TestUtils.renderIntoDocument(
        <SectionTitle>{mocks.titleText}</SectionTitle>
      );

      renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('renders parsed children', () => {
      expect(renderedDOMElement).to.have.property('textContent', mocks.titleText);
    });

    it('renders component with proper default classes', () => {
      const className = renderedDOMElement.className;

      expect(className).to.not.contain(defaults.subtitleClass);
    });
  });

  describe('Last row and desktop classes testing', () => {
    before(() => {
      component = TestUtils.renderIntoDocument(
        <SectionTitle isSubtitle={true}>
          {mocks.titleText}
        </SectionTitle>
      );
    });

    it('renders component with proper classes', () => {
      const className = ReactDOM.findDOMNode(component).className;

      expect(className).to.contain(defaults.subtitleClass);
    });
  });
});
