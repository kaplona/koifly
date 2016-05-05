'use strict';

require('../../src/test-dom')();
var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var expect = require('chai').expect;

var FeatureColumn = require('../../src/components/home-page/feature-column');



describe('FeatureColumn component', () => {

    var component;
    var renderedDOMElement;

    var defaults = {
        leftFloatClass: 'x-left-float',
        rightFloatClass: 'x-right-float'
    };

    var mocks = {
        childText: 'test child text'
    };

    describe('Defaults testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <FeatureColumn>{ mocks.childText }</FeatureColumn>
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('renders parsed children without float', () => {
            let className = renderedDOMElement.className;

            expect(renderedDOMElement).to.have.property('textContent', mocks.childText);
            expect(className)
                .to.not.contain(defaults.leftFloatClass)
                .and.not.contain(defaults.rightFloatClass);
        });
    });

    describe('Left float testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <FeatureColumn float='left' >{ mocks.childText }</FeatureColumn>
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('renders children with proper float', () => {
            let className = renderedDOMElement.className;

            expect(className)
                .to.contain(defaults.leftFloatClass)
                .and.not.contain(defaults.rightFloatClass);
        });
    });

    describe('Right float testing', () => {
        before(() => {
            component = TestUtils.renderIntoDocument(
                <FeatureColumn float='right' >{ mocks.childText }</FeatureColumn>
            );

            renderedDOMElement = ReactDOM.findDOMNode(component);
        });

        it('renders children with proper float', () => {
            let className = renderedDOMElement.className;

            expect(className)
                .to.contain(defaults.rightFloatClass)
                .and.not.contain(defaults.leftFloatClass);
        });
    });
});
