'use strict';

require('../../src/test-dom')();

var React = require('react/addons');
var ErrorTypes = require('../../src/errors/error-types');
var ErrorBox = require('../../src/components/common/notice/error-box');

var Notice = require('../../src/components/common/notice/notice');

var expect = require('chai').expect;



describe('ErrorBox component', () => {

    var TestUtils = React.addons.TestUtils;

    var component;

    var defaults = {
        noticeType: 'error',
        buttonText: 'Try Again',
        buttonTryingText: 'Trying ...'
    };

    var mocks = {
        error: { type: 'testError', message: 'test error' },
        handleTryAgain: () => {}
    };


    describe('Defaults testing', () => {

        it('renders notice with proper default props', () => {
            component = TestUtils.renderIntoDocument(
                <ErrorBox
                    error={ mocks.error }
                    onTryAgain={ mocks.handleTryAgain }
                    />
            );

            let notice = TestUtils.findRenderedComponentWithType(component, Notice);

            expect(notice).to.have.deep.property('props.text', mocks.error.message);
            expect(notice).to.have.deep.property('props.type', defaults.noticeType);
            expect(notice).to.have.deep.property('props.buttonText', defaults.buttonText);
            expect(notice).to.have.deep.property('props.onClick', mocks.handleTryAgain);
        });

        it('renders notice with proper button text', () => {
            component = TestUtils.renderIntoDocument(
                <ErrorBox
                    error={ mocks.error }
                    isTrying={ true }
                    onTryAgain={ mocks.handleTryAgain }
                    />
            );

            let notice = TestUtils.findRenderedComponentWithType(component, Notice);

            expect(notice).to.have.deep.property('props.buttonText', defaults.buttonTryingText);
        });

        it('doesn\'t pass onClick function for some designated errors', () => {
            let error = { type: ErrorTypes.RECORD_NOT_FOUND, message: 'non clickable error box' };
            component = TestUtils.renderIntoDocument(
                <ErrorBox
                    error={ error }
                    onTryAgain={ mocks.handleTryAgain }
                    />
            );

            let notice = TestUtils.findRenderedComponentWithType(component, Notice);

            expect(notice).to.have.deep.property('props.onClick', null);


            error = { type: ErrorTypes.VALIDATION_ERROR, message: 'non clickable error box' };
            component = TestUtils.renderIntoDocument(
                <ErrorBox
                    error={ error }
                    onTryAgain={ mocks.handleTryAgain }
                    />
            );

            notice = TestUtils.findRenderedComponentWithType(component, Notice);

            expect(notice).to.have.deep.property('props.onClick', null);
        });
    });
});
