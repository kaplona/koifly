/* eslint-disable no-unused-expressions */

'use strict';

require('../../src/test-dom')();

var React = require('react/addons');
var Promise = require('es6-promise').Promise;
var PubSub = require('../../src/utils/pubsub');

var then = require('../../src/utils/then');
var Chai = require('chai');
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = Chai.expect;
Chai.use(sinonChai);

var PilotModel = require('../../src/models/pilot');

const STORE_MODIFIED_EVENT = require('../../src/constants/data-service-constants').STORE_MODIFIED_EVENT;

var Header = require('../../src/components/common/menu/header');



describe('Header component', () => {

    var TestUtils = React.addons.TestUtils;
    var Simulate = TestUtils.Simulate;

    var component;
    var renderedDOMElement;

    var defaults = {
        loginText: 'Log In',
        logoutText: 'Log Out',
        linkClassName: 'logout'
    };

    var mocks = {
        pilotLogout: null // will be used for stub function
    };


    before(() => {
        mocks.pilotLogout = Sinon.stub(PilotModel, 'logout', () => {
            return Promise.reject();
        });

        Sinon
            .stub(PilotModel, 'isLoggedIn')
            .returns(true)
            .onFirstCall().returns(false); // will be called with initial render

        component = TestUtils.renderIntoDocument(
            <Header />
        );

        renderedDOMElement = React.findDOMNode(component);
    });

    after(() => {
        PilotModel.logout.restore();
        PilotModel.isLoggedIn.restore();
    });

    it('renders link with login text', () => {
        let loginLink = renderedDOMElement.querySelector(`.${defaults.linkClassName}`);

        expect(loginLink).to.have.property('textContent', defaults.loginText);
    });

    it('changes state when storeModified event emitted', done => {
        expect(component).to.have.deep.property('state.isLoggedIn', false);

        PubSub.emit(STORE_MODIFIED_EVENT);

        then(() => {
            expect(component).to.have.deep.property('state.isLoggedIn', true);
            done();
        });
    });

    it('renders link with logout text and logout on click', () => {
        let logoutLink = renderedDOMElement.querySelector(`.${defaults.linkClassName}`);

        expect(logoutLink).to.have.property('textContent', defaults.logoutText);

        Simulate.click(logoutLink);

        expect(mocks.pilotLogout).to.be.calledOnce;
    });
});
