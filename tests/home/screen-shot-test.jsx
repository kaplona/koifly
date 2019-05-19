'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const _ = require('lodash');
const expect = require('chai').expect;

const ScreenShot = require('../../src/components/home-page/screen-shot');


describe('ScreenShot component', () => {

  let component;
  let renderedDOMElement;

  const defaults = {
    types: ['flights', 'sites', 'gliders']
  };

  const mocks = {
    randomType: null
  };

  before(() => {
    mocks.randomType = _.sample(defaults.types);

    component = TestUtils.renderIntoDocument(
      <ScreenShot type={mocks.randomType}/>
    );

    renderedDOMElement = ReactDOM.findDOMNode(component);
  });

  it('renders header component and parsed children', () => {
    const children = renderedDOMElement.children;

    expect(children).to.have.lengthOf(2);
    expect(children[0])
      .to.have.property('className')
      .that.contain(mocks.randomType);
    expect(children[1])
      .to.have.property('className')
      .that.contain(mocks.randomType);
  });
});
