'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;

const BreadCrumbs = require('../../src/components/common/bread-crumbs');


describe('BreadCrumbs component', () => {
  let component;

  const mocks = {
    firstElementText: 'test first element text',
    secondElementText: 'test second element text',
    thirdElementText: 'test third element text'
  };

  before(() => {
    component = TestUtils.renderIntoDocument(
      <BreadCrumbs
        elements={[
          <div>{mocks.firstElementText}</div>,
          mocks.secondElementText,
          mocks.thirdElementText
        ]}
      />
    );
  });

  it('renders proper layout and parsed element at proper places', () => {
    const crumbs = ReactDOM.findDOMNode(component).children;

    expect(crumbs).to.have.lengthOf(3);

    // First crumb should contain a div element
    const firstCrumbChildren = crumbs[0].children;

    expect(firstCrumbChildren).to.have.lengthOf(1);
    expect(firstCrumbChildren[0]).to.have.property('textContent', mocks.firstElementText);

    // Other crumbs should contain plain text
    expect(crumbs[1])
      .to.have.property('textContent')
      .that.contain(mocks.secondElementText);
    expect(crumbs[2])
      .to.have.property('textContent')
      .that.contain(mocks.thirdElementText);
  });
});
