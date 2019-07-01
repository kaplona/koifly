'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;

const FeatureColumn = require('../../src/components/home-page/feature-column');


describe('FeatureColumn component', () => {
  let component;
  let renderedDOMElement;

  const defaults = {
    leftFloatClass: 'x-left-float',
    rightFloatClass: 'x-right-float'
  };

  const mocks = {
    childText: 'test child text'
  };

  describe('Defaults testing', () => {
    before(() => {
      component = TestUtils.renderIntoDocument(
        <FeatureColumn>{mocks.childText}</FeatureColumn>
      );

      renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('renders parsed children without float', () => {
      const className = renderedDOMElement.className;

      expect(renderedDOMElement).to.have.property('textContent', mocks.childText);
      expect(className)
        .to.not.contain(defaults.leftFloatClass)
        .and.not.contain(defaults.rightFloatClass);
    });
  });

  describe('Left float testing', () => {
    before(() => {
      component = TestUtils.renderIntoDocument(
        <FeatureColumn float='left'>{mocks.childText}</FeatureColumn>
      );

      renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('renders children with proper float', () => {
      const className = renderedDOMElement.className;

      expect(className)
        .to.contain(defaults.leftFloatClass)
        .and.not.contain(defaults.rightFloatClass);
    });
  });

  describe('Right float testing', () => {
    before(() => {
      component = TestUtils.renderIntoDocument(
        <FeatureColumn float='right'>{mocks.childText}</FeatureColumn>
      );

      renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('renders children with proper float', () => {
      const className = renderedDOMElement.className;

      expect(className)
        .to.contain(defaults.rightFloatClass)
        .and.not.contain(defaults.leftFloatClass);
    });
  });
});
