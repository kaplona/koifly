'use strict';

const React = require('react');
const {func, object} = React.PropTypes;
const EmailVerificationNotice = require('./notice/email-verification-notice');
const ErrorTypes = require('../../errors/error-types');
const Login = require('../public-views/login');
const PilotModel = require('../../models/pilot');
const PubSub = require('../../utils/pubsub');

const STORE_MODIFIED_EVENT = require('../../constants/data-service-constants').STORE_MODIFIED_EVENT;


const View = React.createClass({

  propTypes: {
    onStoreModified: func.isRequired,
    error: object
  },

  getInitialState: function () {
    return {
      isEmailVerificationNotice: false
    };
  },

  componentDidMount: function () {
    PubSub.on(STORE_MODIFIED_EVENT, this.handleStoreModified, this);
    this.handleStoreModified();
  },

  componentWillUnmount: function () {
    PubSub.removeListener(STORE_MODIFIED_EVENT, this.handleStoreModified, this);
  },

  handleStoreModified: function () {
    this.props.onStoreModified();
    this.setState({isEmailVerificationNotice: PilotModel.getEmailVerificationNoticeStatus()});
  },

  handleCloseNotice: function () {
    PilotModel.hideEmailVerificationNotice();
    this.setState({isEmailVerificationNotice: false});
  },

  renderNotice: function () {
    if (this.state.isEmailVerificationNotice) {
      return <EmailVerificationNotice isPadded={true} onClose={this.handleCloseNotice}/>;
    }
  },

  render: function () {
    if (this.props.error && this.props.error.type === ErrorTypes.AUTHENTICATION_ERROR) {
      return <Login isStayOnThisPage={true}/>;
    }

    return (
      <div>
        {this.renderNotice()}
        {this.props.children}
      </div>
    );
  }
});


module.exports = View;
