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

const MobileTopMenu = require('../../src/components/common/menu/mobile-top-menu');


describe('MobileTopMenu component', () => {
  let component;

  const defaults = {
    headerClass: 'header',
    leftNavigationRef: 'left-navigation',
    rightNavigationRef: 'right-navigation'
  };

  const mocks = {
    headerText: 'test header text',
    leftButtonCaption: 'test left capture',
    rightButtonCaption: 'test right capture',
    handleLeftClick: Sinon.spy(),
    handleRightClick: Sinon.spy()
  };


  before(() => {
    component = TestUtils.renderIntoDocument(
      <MobileTopMenu
        header={mocks.headerText}
        leftButtonCaption={mocks.leftButtonCaption}
        rightButtonCaption={mocks.rightButtonCaption}
        onLeftClick={mocks.handleLeftClick}
        onRightClick={mocks.handleRightClick}
      />
    );
  });

  it('renders proper layout', () => {
    const headerElement = ReactDOM.findDOMNode(component).querySelector('.header');
    const leftNavigationElement = component.refs[defaults.leftNavigationRef];
    const rightNavigationElement = component.refs[defaults.rightNavigationRef];

    expect(headerElement).to.have.property('textContent', mocks.headerText);
    expect(leftNavigationElement).to.have.property('textContent', mocks.leftButtonCaption);
    expect(rightNavigationElement).to.have.property('textContent', mocks.rightButtonCaption);
  });

  it('triggers right onClick event when navigation element clicked', () => {
    const leftNavigationElement = component.refs[defaults.leftNavigationRef];

    Simulate.click(leftNavigationElement);

    expect(mocks.handleLeftClick).to.be.calledOnce;
    expect(mocks.handleRightClick).to.not.be.called;

    const rightNavigationElement = component.refs[defaults.rightNavigationRef];

    Simulate.click(rightNavigationElement);

    expect(mocks.handleLeftClick).to.be.calledOnce; // to still be called just once
    expect(mocks.handleRightClick).to.be.calledOnce;
  });
});
