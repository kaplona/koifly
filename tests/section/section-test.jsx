/* eslint-disable no-unused-expressions */

'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const Simulate = TestUtils.Simulate;
const Chai = require('chai');
const expect = Chai.expect;
const Sinon = require('sinon');
const sinonChai = require('sinon-chai');
Chai.use(sinonChai);

const Section = require('../../src/components/common/section/section');
const Button = require('../../src/components/common/buttons/button');


describe('Section component', () => {
  let component;
  let renderedDOMElement;

  const defaults = {
    fullScreenClass: 'x-full-screen'
  };

  const mocks = {
    sectionText: 'test children text',
    handleClick: Sinon.spy()
  };

  describe('Defaults testing', () => {
    before(() => {
      component = TestUtils.renderIntoDocument(
        <Section>{mocks.sectionText}</Section>
      );

      renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('renders parsed children', () => {
      expect(renderedDOMElement).to.have.property('textContent', mocks.sectionText);
    });

    it('doesn\'t render edit button and full-screen component by default', () => {
      const editButton = TestUtils.scryRenderedComponentsWithType(component, Button);
      const className = renderedDOMElement.className;

      expect(editButton).to.have.lengthOf(0);
      expect(className).to.not.contain(defaults.fullScreenClass);
    });
  });

  describe('Fullscreen and edit button testing', () => {
    before(() => {
      component = TestUtils.renderIntoDocument(
        <Section isFullScreen={true} onEditClick={mocks.handleClick}>
          {mocks.sectionText}
        </Section>
      );
    });

    it('renders edit button and full-screen component', () => {
      const className = ReactDOM.findDOMNode(component).className;

      expect(className).to.contain(defaults.fullScreenClass);
    });

    it('renders edit button and call proper onClick function', () => {
      const editButton = TestUtils.findRenderedComponentWithType(component, Button);

      expect(editButton).to.have.deep.property('props.onClick', mocks.handleClick);

      const renderedDOMButton = ReactDOM.findDOMNode(editButton);

      Simulate.click(renderedDOMButton);

      expect(mocks.handleClick).to.have.been.calledOnece;
    });
  });
});
