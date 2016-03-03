'use strict';

require('../../src/test-dom')();

var React = require('react/addons');
var Header = require('../../src/components/common/menu/header');

var PilotModel = require('../../src/models/pilot');
var PubSub = require('../../src/utils/pubsub');
var Link = require('react-router').Link;

var then = require('../../src/utils/then');
var Chai = require('chai');
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = Chai.expect;
Chai.use(sinonChai);



describe('Header component', () => {

    var TestUtils = React.addons.TestUtils;
    var Simulate = TestUtils.Simulate;

    var component;

    var defaults = {
        loginText: 'Log In',
        logoutText: 'Log Out',
        eventToListen: 'dataModified'
    };

    var mocks = {};


    describe('Defaults testing', () => {
        before(() => {
            mocks.pilotLogout = Sinon.stub(PilotModel, 'logout');

            Sinon.stub(PilotModel, 'isLoggedIn', () => {
                return false;
            });

            component = TestUtils.renderIntoDocument(
                <Header />
            );
        });

        after(() => {
            PilotModel.logout.restore();
            PilotModel.isLoggedIn.restore();
        });

        it('renders Link with login text and no onClick prop', () => {
            let loginLink = TestUtils.findRenderedComponentWithType(component, Link);

            expect(loginLink).to.have.deep.property('props.children', defaults.loginText);
            expect(loginLink).to.have.deep.property('props.onClick', null);

            Simulate.click(React.findDOMNode(loginLink));

            expect(mocks.pilotLogout).to.not.be.called;
        });

        it('changes state when dataModified event emitted', (done) => {
            // here we restore PilotModel isLoggedIn method
            // in order to stub it again but with other function that returns true
            // emitting event should trigger setState of Header component and rerender it
            PilotModel.isLoggedIn.restore();
            Sinon.stub(PilotModel, 'isLoggedIn', () => {
                return true;
            });

            expect(component).to.have.deep.property('state.isLoggedIn', false);

            PubSub.emit(defaults.eventToListen);

            then(() => {
                expect(component).to.have.deep.property('state.isLoggedIn', true);
                done();
            });
        });

        it('renders Link with logout text and logout on click', () => {
            let logoutLink = TestUtils.findRenderedComponentWithType(component, Link);

            expect(logoutLink).to.have.deep.property('props.children', defaults.logoutText);
            expect(logoutLink.props.onClick).to.not.equal(null);

            Simulate.click(React.findDOMNode(logoutLink));

            expect(mocks.pilotLogout).to.be.calledOnce;
        });
    });
});
