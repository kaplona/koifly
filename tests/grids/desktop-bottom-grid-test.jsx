'use strict';

require('../../src/test-dom')();

const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;

const DesktopBottomGrid = require('../../src/components/common/grids/desktop-bottom-grid');


describe('DesktopBottomGrid component', () => {

  let component;
  let renderedDomElement;

  const defaults = {
    containerClass: 'bottom-grid',
    leftElementsClass: 'left-elements',
    rightElementClass: 'right-element'
  };

  const mocks = {
    leftElement1Text: 'left-1-element',
    leftElement2Text: 'left-2-element',
    rightElementText: 'right-element'
  };

  before(() => {
    component = TestUtils.renderIntoDocument(
      <DesktopBottomGrid
        leftElements={[
          <div>{mocks.leftElement1Text}</div>,
          <div>{mocks.leftElement2Text}</div>
        ]}
        rightElement={<div>{mocks.rightElementText}</div>}
      />
    );

    renderedDomElement = ReactDOM.findDOMNode(component);
  });

  it('renders proper layout for parsed elements', () => {
    const parentClass = renderedDomElement.className;
    const children = renderedDomElement.children;

    expect(parentClass).to.equal(defaults.containerClass);
    expect(children).to.have.lengthOf(2);
    expect(children[0]).to.have.property('className', defaults.leftElementsClass);
    expect(children[1]).to.have.property('className', defaults.rightElementClass);
  });

  it('renders parsed Components in proper places', () => {
    const leftElements = renderedDomElement.querySelector(`.${defaults.leftElementsClass}`).getElementsByTagName('div');

    expect(leftElements).to.have.lengthOf(4);
    // second and fourth div should be elements parsed as props,
    // the others are just wrappers
    expect(leftElements[1]).to.have.property('textContent', mocks.leftElement1Text);
    expect(leftElements[3]).to.have.property('textContent', mocks.leftElement2Text);

    const rightElement = renderedDomElement.querySelector(`.${defaults.rightElementClass} div`);

    expect(rightElement).to.have.property('textContent', mocks.rightElementText);
  });
});
