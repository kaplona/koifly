'use strict';

require('../../src/test-dom')();
var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var expect = require('chai').expect;

var DaysSinceLastFlight = require('../../src/components/common/days-since-last-flight');



describe('DaysSinceLastFlight component', () => {

    var component;
    var renderedDOMElement;

    var defaults = {
        noFlightsYetText: 'No flights yet',
        greenClassName: 'x-green'
    };

    var mocks = {
        moreThatTwoWeeks: 32,
        lessThatTwoWeeks: 5
    };


    describe('No flights yet testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <DaysSinceLastFlight />
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('renders default text if no days prop parsed', () => {
            let className = renderedDOMElement.className;

            expect(renderedDOMElement).to.have.property('textContent', defaults.noFlightsYetText);
            expect(className).to.not.contain(defaults.greenClassName);
        });
    });


    describe('Days props testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <DaysSinceLastFlight
                    days={ mocks.moreThatTwoWeeks }
                    />
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('renders text with parsed days', () => {
            let className = renderedDOMElement.className;

            expect(renderedDOMElement)
                .to.have.property('textContent')
                .that.contain(mocks.moreThatTwoWeeks);
            expect(className).to.not.contain(defaults.greenClassName);
        });
    });


    describe('Less than two weeks break test', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <DaysSinceLastFlight
                    days={ mocks.lessThatTwoWeeks }
                    />
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('renders component with proper class', () => {
            let className = renderedDOMElement.className;

            expect(className).to.contain(defaults.greenClassName);
        });
    });
});
