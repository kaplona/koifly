'use strict';

require('../../src/test-dom')();
var React = require('react/addons');

var expect = require('chai').expect;

var DaysSinceLastFlight = require('../../src/components/common/days-since-last-flight');



describe('DaysSinceLastFlight component', () => {

    var TestUtils = React.addons.TestUtils;

    var component;
    var renderedDOMElement;

    var defaults = {
        noFlightsYetText: 'no flights yet'
    };

    var mocks = {
        days: 32
    };

    describe('No flights yet testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <DaysSinceLastFlight />
            );

            renderedDOMElement = React.findDOMNode(component)
        });

        it('renders default text if no days prop parsed', () => {
            expect(renderedDOMElement).to.have.property('textContent', defaults.noFlightsYetText);
        });
    });

    describe('Days props testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <DaysSinceLastFlight
                    days={ mocks.days }
                    />
            );

            renderedDOMElement = React.findDOMNode(component)
        });

        it('renders text with parsed days', () => {
            expect(renderedDOMElement)
                .to.have.property('textContent')
                .that.contain(mocks.days);
        });
    });
});
