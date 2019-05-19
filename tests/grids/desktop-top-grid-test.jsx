'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;

const DesktopTopGrid = require('../../src/components/common/grids/desktop-top-grid');


describe('DesktopTopGrid component', () => {

  let component;
  let renderedDomElement;

  const defaults = {
    containerClass: 'top-grid',
    leftElementClass: 'left-element',
    middleElementClass: 'middle-element',
    rightElementClass: 'right-element'
  };

  const mocks = {
    leftElementText: 'left-element',
    middleElementText: 'middle-element',
    rightElementText: 'right-element'
  };

  before(() => {
    component = TestUtils.renderIntoDocument(
      <DesktopTopGrid
        leftElement={<div>{mocks.leftElementText}</div>}
        middleElement={<div>{mocks.middleElementText}</div>}
        rightElement={<div>{mocks.rightElementText}</div>}
      />
    );

    renderedDomElement = ReactDOM.findDOMNode(component);
  });

  it('renders proper layout for parsed elements', () => {
    const parentClass = renderedDomElement.className;
    const children = renderedDomElement.children;

    expect(parentClass).to.equal(defaults.containerClass);
    expect(children).to.have.lengthOf(3);
    expect(children[0]).to.have.property('className', defaults.leftElementClass);
    expect(children[1]).to.have.property('className', defaults.middleElementClass);
    expect(children[2]).to.have.property('className', defaults.rightElementClass);
  });

  it('renders parsed Components in proper places', () => {
    const leftElement = renderedDomElement.querySelector(`.${defaults.leftElementClass} div`);
    expect(leftElement).to.have.property('textContent', mocks.leftElementText);

    const middleElement = renderedDomElement.querySelector(`.${defaults.middleElementClass} div`);
    expect(middleElement).to.have.property('textContent', mocks.middleElementText);

    const rightElement = renderedDomElement.querySelector(`.${defaults.rightElementClass} div`);
    expect(rightElement).to.have.property('textContent', mocks.rightElementText);
  });
});
