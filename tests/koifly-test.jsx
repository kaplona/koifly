/* eslint-disable no-unused-expressions */

'use strict';

require('../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;

const Koifly = require('../src/components/koifly');
const Header = require('../src/components/common/menu/header');


describe('Koifly component', () => {
  let component;
  let renderedDOMElement;

  const mocks = {
    childText: 'test child text',
    childClassName: 'childClass'
  };

  before(() => {
    component = TestUtils.renderIntoDocument(
      <Koifly>
        <div className={mocks.childClassName}>{mocks.childText}</div>
      </Koifly>
    );

    renderedDOMElement = ReactDOM.findDOMNode(component);
  });

  it('renders header component and parsed children', () => {
    const header = TestUtils.findRenderedComponentWithType(component, Header);
    const children = renderedDOMElement.querySelector(`.${mocks.childClassName}`);

    expect(header).to.be.ok;
    expect(children).to.have.property('textContent', mocks.childText);
  });
});
