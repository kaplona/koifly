/* eslint-disable no-unused-expressions */

'use strict';

require('../../src/test-dom')();
var React = require('react/addons');
var PubSub = require('../../src/utils/pubsub');

var then = require('../../src/utils/then');
var Chai = require('chai');
var expect = Chai.expect;
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
Chai.use(sinonChai);

var ErrorTypes = require('../../src/errors/error-types');
var PilotModel = require('../../src/models/pilot');

const STORE_MODIFIED_EVENT = require('../../src/constants/data-service-constants').STORE_MODIFIED_EVENT;

var View = require('../../src/components/common/view');
var EmailVerificationNotice = require('../../src/components/common/notice/email-verification-notice');
var Login = require('../../src/components/public-views/login');



describe('View component.', () => {

    var TestUtils = React.addons.TestUtils;
    var Simulate = TestUtils.Simulate;

    var component;
    var renderedDOMElement;

    var defaults = {
        noticeCloseButtonClass: 'close'
    };

    var mocks = {
        childText: 'test child text',
        childClassName: 'testChild',
        authError: { type: ErrorTypes.AUTHENTICATION_ERROR },
        notAuthError: { type: 'notAuthError' },
        handleStoreModified: Sinon.spy(),
        handleHideNotice: null
    };


    describe('Defaults testing.', () => {
        before(() => {

            Sinon
                .stub(PilotModel, 'getEmailVerificationNoticeStatus')
                .onFirstCall().returns(false)
                .onSecondCall().returns(true);

            mocks.handleHideNotice = Sinon.stub(PilotModel, 'hideEmailVerificationNotice');

            component = TestUtils.renderIntoDocument(
                <View
                    onStoreModified={ mocks.handleStoreModified }
                    error={ mocks.notAuthError }
                    >
                    { mocks.childText }
                </View>
            );

            renderedDOMElement = React.findDOMNode(component);
        });

        after(() => {
            PilotModel.getEmailVerificationNoticeStatus.restore();
            PilotModel.hideEmailVerificationNotice.restore();
        });

        it('sets default state and renders only parsed children', () => {
            let notices = TestUtils.scryRenderedComponentsWithType(component, EmailVerificationNotice);
            let loginForm = TestUtils.scryRenderedComponentsWithType(component, Login);

            expect(component).to.have.deep.property('state.isEmailVerificationNotice', false);
            expect(renderedDOMElement).to.have.property('textContent', mocks.childText);
            expect(notices).to.have.lengthOf(0);
            expect(loginForm).to.have.lengthOf(0);
        });

        it('requests for store data once component was mounted', () => {
            expect(mocks.handleStoreModified).to.have.been.calledOnce;
        });

        it('requests for store data again when store-was-modified event emitted', done => {
            PubSub.emit(STORE_MODIFIED_EVENT);

            then(() => {
                expect(mocks.handleStoreModified).to.have.been.calledTwice;
                // component called PilotModel.getActivationNoticeStatus which returned true on second call
                expect(component).to.have.deep.property('state.isEmailVerificationNotice', true);

                done();
            });
        });

        it('renders email not verified notice with proper props', () => {
            let notice = TestUtils.findRenderedComponentWithType(component, EmailVerificationNotice);

            expect(notice).to.be.ok;
            expect(notice).to.have.deep.property('props.onClose');
        });

        it('close email-not-verified notice when close button clicked', done => {
            let notice = TestUtils.findRenderedComponentWithType(component, EmailVerificationNotice);
            let renderedDOMNotice = React.findDOMNode(notice);
            let closeButton = renderedDOMNotice.querySelector(`.${defaults.noticeCloseButtonClass}`);

            Simulate.click(closeButton);

            then(() => {
                expect(component).to.have.deep.property('state.isEmailVerificationNotice', false);
                expect(mocks.handleHideNotice).to.have.been.calledOnce;

                done();
            });
        });
    });


    describe('Authentication error testing', () => {
        before(() => {
            Sinon.stub(PilotModel, 'getEmailVerificationNoticeStatus');

            component = TestUtils.renderIntoDocument(
                <View
                    onStoreModified={ mocks.handleStoreModified }
                    error={ mocks.authError }
                    >
                    <div className={ mocks.childClassName } >{ mocks.childText }</div>
                </View>
            );

            renderedDOMElement = React.findDOMNode(component);
        });

        after(() => {
            PilotModel.getEmailVerificationNoticeStatus.restore();
        });

        it('renders login form instead of parsed children', () => {
            let loginForm = TestUtils.findRenderedComponentWithType(component, Login);
            let parsedChildren = renderedDOMElement.querySelectorAll(`.${mocks.childClassName}`);

            expect(loginForm).to.be.ok;
            expect(parsedChildren).to.have.lengthOf(0);
        });
    });
});
