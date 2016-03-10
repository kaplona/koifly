'use strict';

require('../../src/test-dom')();

var React = require('react/addons');
var Promise = require('es6-promise').Promise;

var then = require('../../src/utils/then');
var expect = require('chai').expect;
var Sinon = require('sinon');

var DataService = require('../../src/services/data-service');
var PilotModel = require('../../src/models/pilot');

var EmailVerificationNotice = require('../../src/components/common/notice/email-verification-notice');
var Notice = require('../../src/components/common/notice/notice');



describe('EmailVerificationNotice component', () => {

    var TestUtils = React.addons.TestUtils;
    var Simulate = TestUtils.Simulate;

    var component;

    var defaults = {
        successNoticeText: 'The verification link was sent to your email',
        buttonText: 'Send email again',
        buttonSendingText: 'Sending...',
        successType: 'success'
    };

    var mocks = {
        noticeText: 'test text',
        noticeType: 'test type',
        email: 'testEmail@test.com',
        handleClose: () => {}
    };


    describe('Defaults testing', () => {
        before(() => {
            Sinon.stub(DataService, 'sendVerificationEmail', () => {
                return Promise.resolve();
            });

            Sinon.stub(PilotModel, 'getEmailAddress', () => {
                return mocks.email;
            });

            component = TestUtils.renderIntoDocument(
                <EmailVerificationNotice
                    text={ mocks.noticeText }
                    type={ mocks.noticeType }
                    onClose={ mocks.handleClose }
                    />
            );
        });

        after(() => {
            DataService.sendVerificationEmail.restore();
            PilotModel.getEmailAddress.restore();
        });

        it('sets default state and renders notice with proper props', () => {
            let notice = TestUtils.findRenderedComponentWithType(component, Notice);

            expect(component).to.have.deep.property('state.isEmailSent', false);
            expect(component).to.have.deep.property('state.isSending', false);
            expect(notice).to.have.deep.property('props.text', mocks.noticeText);
            expect(notice).to.have.deep.property('props.type', mocks.noticeType);
            expect(notice).to.have.deep.property('props.buttonText', defaults.buttonText);
            expect(notice).to.have.deep.property('props.isButtonEnabled', true);
            expect(notice).to.have.deep.property('props.onClose', mocks.handleClose);
        });

        it('changes state and view once send-email button clicked', (done) => {
            let button = React.findDOMNode(component).querySelector('input');

            Simulate.click(button);

            then(() => {
                let notice = TestUtils.findRenderedComponentWithType(component, Notice);

                expect(component).to.have.deep.property('state.isEmailSent', true);
                expect(component).to.have.deep.property('state.isSending', true);
                expect(notice)
                    .to.have.deep.property('props.text')
                    .that.contain(defaults.successNoticeText)
                    .and.contain(mocks.email);
                expect(notice).to.have.deep.property('props.type', defaults.successType);
                expect(notice).to.have.deep.property('props.buttonText', defaults.buttonSendingText);
                expect(notice).to.have.deep.property('props.isButtonEnabled', false);
                expect(notice).to.have.deep.property('props.onClick', null);
                expect(notice).to.have.deep.property('props.onClose', null);

                done();
            });
        });
    });
});
