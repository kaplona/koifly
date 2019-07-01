'use strict';

require('../../src/test-dom')();
const React = require('react');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;

const Label = require('../../src/components/common/section/label');
const RowContent = require('../../src/components/common/section/row-content');
const ValueContainer = require('../../src/components/common/section/value-container');


describe('RowContent component', () => {
  let component;

  const mocks = {
    labelText: 'test label text',
    valueText: 'test value text'
  };


  before(() => {
    component = TestUtils.renderIntoDocument(
      <RowContent
        label={mocks.labelText}
        value={mocks.valueText}
      />
    );
  });

  it('renders passed props text in proper places', () => {
    const label = TestUtils.findRenderedComponentWithType(component, Label);
    const valueContainer = TestUtils.findRenderedComponentWithType(component, ValueContainer);

    expect(label).to.have.deep.property('props.children', mocks.labelText);
    expect(valueContainer).to.have.deep.property('props.children', mocks.valueText);
  });
});
