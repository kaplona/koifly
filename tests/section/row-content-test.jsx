'use strict';

require('../../src/test-dom')();

var React = require('react/addons');

var RowContent = require('../../src/components/common/section/row-content');

var Label = require('../../src/components/common/section/label');
var ValueContainer = require('../../src/components/common/section/value-container');

var expect = require('chai').expect;



describe('RowContent component', () => {

    var TestUtils = React.addons.TestUtils;

    var component;

    var mocks = {
        labelText: 'test label text',
        valueText: 'test value text'
    };


    before(() => {
        component = TestUtils.renderIntoDocument(
            <RowContent
                label={ mocks.labelText }
                value={ mocks.valueText }
                />
        );
    });

    it('renders passed props text in proper places', () => {
        let label = TestUtils.findRenderedComponentWithType(component, Label);
        let valueContainer = TestUtils.findRenderedComponentWithType(component, ValueContainer);

        expect(label).to.have.deep.property('props.children', mocks.labelText);
        expect(valueContainer).to.have.deep.property('props.children', mocks.valueText);
    });
});
