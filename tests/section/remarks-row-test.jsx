'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;

const RemarksRow = require('../../src/components/common/section/remarks-row');


describe('RemarksRow component', () => {

  let component;

  const defaults = {
    className: 'remarks'
  };

  const mocks = {
    firstLine: 'first test line',
    secondLine: 'second test line',
    thirdLine: 'third test line'
  };


  before(() => {
    component = TestUtils.renderIntoDocument(
      <RemarksRow
        value={[
          mocks.firstLine,
          mocks.secondLine,
          mocks.thirdLine
        ].join('\n')}
      />
    );
  });

  it('renders remarks in proper place and split it into new lines', () => {
    const remarks = ReactDOM.findDOMNode(component).querySelector(`.${defaults.className}`);
    const remarksSpans = remarks.children;
    const remarksNewLines = remarks.getElementsByTagName('br');

    expect(remarksSpans).to.have.lengthOf(3);
    expect(remarksNewLines).to.have.lengthOf(3);
    expect(remarksSpans[0]).to.property('textContent', mocks.firstLine);
    expect(remarksSpans[1]).to.property('textContent', mocks.secondLine);
    expect(remarksSpans[2]).to.property('textContent', mocks.thirdLine);
  });
});
