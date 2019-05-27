'use strict';

require('../../src/test-dom')();
const React = require('react');
const TestUtils = require('react-addons-test-utils');
const expect = require('chai').expect;
const errorTypes = require('../../src/errors/error-types');
const ErrorBox = require('../../src/components/common/notice/error-box');

const Notice = require('../../src/components/common/notice/notice');


describe('ErrorBox component', () => {

  let component;

  const defaults = {
    noticeType: 'error',
    buttonText: 'Try Again',
    buttonTryingText: 'Trying ...'
  };

  const mocks = {
    error: { type: 'testError', message: 'test error' },
    handleTryAgain: () => {
    }
  };


  describe('Defaults testing', () => {

    it('renders notice with proper default props', () => {
      component = TestUtils.renderIntoDocument(
        <ErrorBox
          error={mocks.error}
          onTryAgain={mocks.handleTryAgain}
        />
      );

      const notice = TestUtils.findRenderedComponentWithType(component, Notice);

      expect(notice).to.have.deep.property('props.text', mocks.error.message);
      expect(notice).to.have.deep.property('props.type', defaults.noticeType);
      expect(notice).to.have.deep.property('props.buttonText', defaults.buttonText);
      expect(notice).to.have.deep.property('props.onClick', mocks.handleTryAgain);
    });

    it('renders notice with proper button text', () => {
      component = TestUtils.renderIntoDocument(
        <ErrorBox
          error={mocks.error}
          isTrying={true}
          onTryAgain={mocks.handleTryAgain}
        />
      );

      const notice = TestUtils.findRenderedComponentWithType(component, Notice);

      expect(notice).to.have.deep.property('props.buttonText', defaults.buttonTryingText);
    });

    it('doesn\'t pass onClick function for some designated errors', () => {
      let error = { type: errorTypes.RECORD_NOT_FOUND, message: 'non clickable error box' };
      component = TestUtils.renderIntoDocument(
        <ErrorBox
          error={error}
          onTryAgain={mocks.handleTryAgain}
        />
      );

      let notice = TestUtils.findRenderedComponentWithType(component, Notice);

      expect(notice).to.have.deep.property('props.onClick', null);


      error = { type: errorTypes.VALIDATION_ERROR, message: 'non clickable error box' };
      component = TestUtils.renderIntoDocument(
        <ErrorBox
          error={error}
          onTryAgain={mocks.handleTryAgain}
        />
      );

      notice = TestUtils.findRenderedComponentWithType(component, Notice);

      expect(notice).to.have.deep.property('props.onClick', null);
    });
  });
});
