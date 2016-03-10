'use strict';

require('../../src/test-dom')();
var React = require('react/addons');

var Chai = require('chai');
var expect = Chai.expect;
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
Chai.use(sinonChai);

var FirstAdding = require('../../src/components/common/first-adding');



describe('FirstAdding component', () => {

    var TestUtils = React.addons.TestUtils;
    var Simulate = TestUtils.Simulate;

    var component;
    var renderedDOMElement;

    var mocks = {
        dataType: 'test type',
        handleAdding: Sinon.spy()
    };

    before(() => {
        component = TestUtils.renderIntoDocument(
            <FirstAdding
                dataType={ mocks.dataType }
                onAdding={ mocks.handleAdding }
                />
        );

        renderedDOMElement = React.findDOMNode(component)
    });

    it('renders proper text', () => {
        let children = renderedDOMElement.children;

        expect(children[0])
            .to.have.property('textContent')
            .that.contain(mocks.dataType);
    });

    it('triggers onAdding once button clicked', () => {
        let button = renderedDOMElement.querySelector('input');

        Simulate.click(button);

        expect(mocks.handleAdding).to.have.been.calledOnce;
    });
});
