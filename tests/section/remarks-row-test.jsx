'use strict';

require('../../src/test-dom')();

var React = require('react/addons');

var RemarksRow = require('../../src/components/common/section/remarks-row');

var expect = require('chai').expect;



describe('RemarksRow component', () => {

    var TestUtils = React.addons.TestUtils;

    var component;

    var defaults = {
        className: 'remarks'
    };

    var mocks = {
        firstLine: 'first test line',
        secondLine: 'second test line',
        thirdLine: 'third test line'
    };


    before(() => {
        component = TestUtils.renderIntoDocument(
            <RemarksRow
                value={ [
                    mocks.firstLine,
                    mocks.secondLine,
                    mocks.thirdLine
                ].join('\n') }
                />
        );
    });

    it('renders remarks in proper place and split it into new lines', () => {
        let remarks = React.findDOMNode(component).querySelector(`.${defaults.className}`);
        let remarksSpans = remarks.children;
        let remarksNewLines = remarks.getElementsByTagName('br');

        expect(remarksSpans).to.have.lengthOf(3);
        expect(remarksNewLines).to.have.lengthOf(3);
        expect(remarksSpans[0]).to.property('textContent', mocks.firstLine);
        expect(remarksSpans[1]).to.property('textContent', mocks.secondLine);
        expect(remarksSpans[2]).to.property('textContent', mocks.thirdLine);
    });
});
