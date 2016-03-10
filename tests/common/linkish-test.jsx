'use strict';

require('../../src/test-dom')();
var React = require('react/addons');

var Chai = require('chai');
var expect = Chai.expect;
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
Chai.use(sinonChai);

var Linkish = require('../../src/components/common/linkish');



describe('Linkish component', () => {

    var TestUtils = React.addons.TestUtils;
    var Simulate = TestUtils.Simulate;

    var component;
    var renderedDOMElement;

    var mocks = {
        childText: 'test child type',
        handleClick: Sinon.spy()
    };

    before(() => {
        component = TestUtils.renderIntoDocument(
            <Linkish onClick={ mocks.handleClick }>
                { mocks.childText }
            </Linkish>
        );

        renderedDOMElement = React.findDOMNode(component)
    });

    it('renders proper text', () => {
        expect(renderedDOMElement).to.have.property('textContent', mocks.childText);
    });

    it('calls parsed function once clicked', () => {
        Simulate.click(renderedDOMElement);

        expect(mocks.handleClick).to.have.been.calledOnce;
    });
});
