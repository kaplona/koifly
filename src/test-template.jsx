'use strict';

require('../../src/test-dom')();
var React = require('react/addons');

var then = require('../../src/utils/then');
var Chai = require('chai');
var expect = Chai.expect;
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
Chai.use(sinonChai);
// var expect = require('chai').expect;

var Header = require('../../src/components/common/menu/header');
var Link = require('react-router').Link;



describe('Header component', () => {

    var TestUtils = React.addons.TestUtils;
    var Simulate = TestUtils.Simulate;

    var component;
    var renderedDOMElement;

    var defaults = {
        buttonText: 'buttonText'
    };

    var mocks = {
        noticeText: 'test text',
        noticeType: 'test type',
        handleClick: Sinon.spy()
    };


    describe('Defaults testing', () => {
        before(() => {
            Sinon.stub(dataService, 'sendVerificationEmail', () => {
                return Promise.resolve();
            });

            component = TestUtils.renderIntoDocument(
                <Header
                    text={ mocks.noticeText }
                    type={ mocks.noticeType }
                    onClick={ mocks.handleClick }
                    />
            );

            renderedDOMElement = React.findDOMNode(component);
        });

        after(() => {
            dataService.sendVerificationEmail.restore();
        });

        it('sets default state and renders notice with proper props', () => {
            let button = TestUtils.findRenderedComponentWithType(component, Button);

            expect(button).to.have.deep.property('props.text', mocks.buttonText);
        });
    });
});
