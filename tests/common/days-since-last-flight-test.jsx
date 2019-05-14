'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;

const DaysSinceLastFlight = require('../../src/components/common/days-since-last-flight');


describe('DaysSinceLastFlight component', () => {

    let component;
    let renderedDOMElement;

    const defaults = {
        noFlightsYetText: 'No flights yet',
        greenClassName: 'x-green'
    };

    const mocks = {
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
            const className = renderedDOMElement.className;

            expect(renderedDOMElement).to.have.property('textContent', defaults.noFlightsYetText);
            expect(className).to.not.contain(defaults.greenClassName);
        });
    });


    describe('Days props testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <DaysSinceLastFlight
                    days={mocks.moreThatTwoWeeks}
                />
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('renders text with parsed days', () => {
            const className = renderedDOMElement.className;

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
                    days={mocks.lessThatTwoWeeks}
                />
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('renders component with proper class', () => {
            const className = renderedDOMElement.className;

            expect(className).to.contain(defaults.greenClassName);
        });
    });
});
