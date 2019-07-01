/* eslint-disable no-unused-expressions */

'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const Simulate = TestUtils.Simulate;
const then = require('../../src/utils/then');
const Chai = require('chai');
const expect = Chai.expect;
const Sinon = require('sinon');
const sinonChai = require('sinon-chai');
Chai.use(sinonChai);

const Switcher = require('../../src/components/common/switcher');


describe('Switcher component', () => {
  let component;
  let renderedDOMElement;

  const defaults = {
    leftPosition: 'left',
    rightPosition: 'right',
    activeClass: 'active'
  };

  const mocks = {
    leftButtonCaption: 'left test caption',
    rightButtonCaption: 'right test caption',
    handleLeftClick: Sinon.spy(),
    handleRightClick: Sinon.spy()
  };


  describe('Defaults testing', () => {
    before(() => {
      component = TestUtils.renderIntoDocument(
        <Switcher
          leftButtonCaption={mocks.leftButtonCaption}
          rightButtonCaption={mocks.rightButtonCaption}
          onLeftClick={mocks.handleLeftClick}
          onRightClick={mocks.handleRightClick}
          initialPosition={defaults.leftPosition}
        />
      );

      renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('sets proper initial state', () => {
      expect(component).to.have.deep.property('state.isLeftPosition', true);
    });

    it('renders parsed text at proper places and highlights proper switcher part', () => {
      const switcherParts = renderedDOMElement.children;

      expect(switcherParts).to.have.lengthOf(2);
      expect(switcherParts[0]).to.have.property('textContent', mocks.leftButtonCaption);
      expect(switcherParts[1]).to.have.property('textContent', mocks.rightButtonCaption);

      expect(switcherParts[0])
        .to.have.property('className')
        .that.contain(defaults.activeClass);

      expect(switcherParts[1])
        .to.have.property('className')
        .that.not.contain(defaults.activeClass);
    });

    it('Updates state and calls proper function once clicked', done => {
      Simulate.click(renderedDOMElement);

      then(() => {
        expect(mocks.handleRightClick).to.have.been.calledOnce;
        expect(mocks.handleLeftClick).to.have.not.been.called;
        expect(component).to.have.deep.property('state.isLeftPosition', false);

        const leftPartClass = renderedDOMElement.children[0].className;
        const rightPartClass = renderedDOMElement.children[1].className;

        expect(leftPartClass).to.not.contain(defaults.activeClass);
        expect(rightPartClass).to.contain(defaults.activeClass);

        Simulate.click(renderedDOMElement);
      })
        .then(() => {
          expect(mocks.handleRightClick).to.have.been.calledOnce; // still
          expect(mocks.handleLeftClick).to.have.been.calledOnce;
          expect(component).to.have.deep.property('state.isLeftPosition', true);

          const leftPartClass = renderedDOMElement.children[0].className;
          const rightPartClass = renderedDOMElement.children[1].className;

          expect(leftPartClass).to.contain(defaults.activeClass);
          expect(rightPartClass).to.not.contain(defaults.activeClass);

          done();
        });
    });
  });

  describe('Right initial position testing', () => {
    before(() => {
      component = TestUtils.renderIntoDocument(
        <Switcher
          leftButtonCaption={mocks.leftButtonCaption}
          rightButtonCaption={mocks.rightButtonCaption}
          onLeftClick={mocks.handleLeftClick}
          onRightClick={mocks.handleRightClick}
          initialPosition={defaults.rightPosition}
        />
      );

      renderedDOMElement = ReactDOM.findDOMNode(component);
    });

    it('sets proper initial state', () => {
      expect(component).to.have.deep.property('state.isLeftPosition', false);
    });

    it('highlights proper switcher part', () => {
      const leftPartClass = renderedDOMElement.children[0].className;
      const rightPartClass = renderedDOMElement.children[1].className;

      expect(leftPartClass).to.not.contain(defaults.activeClass);
      expect(rightPartClass).to.contain(defaults.activeClass);
    });
  });
});
