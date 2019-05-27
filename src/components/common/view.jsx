'use strict';

import React from 'react';
import { func, object } from 'prop-types';
import dataServiceConstants from '../../constants/data-service-constants';
import EmailVerificationNotice from './notice/email-verification-notice';
import errorTypes from '../../errors/error-types';
import Login from '../public-views/login';
import PilotModel from '../../models/pilot';
import PubSub from '../../utils/pubsub';


export default class View extends React.Component {
  constructor() {
    super();
    this.state = {
      isEmailVerificationNotice: false
    };

    this.handleCloseNotice = this.handleCloseNotice.bind(this);
  }

  componentDidMount() {
    PubSub.on(dataServiceConstants.STORE_MODIFIED_EVENT, this.handleStoreModified, this);
    this.handleStoreModified();
  }

  componentWillUnmount() {
    PubSub.removeListener(dataServiceConstants.STORE_MODIFIED_EVENT, this.handleStoreModified, this);
  }

  handleStoreModified() {
    this.props.onStoreModified();
    this.setState({ isEmailVerificationNotice: PilotModel.getEmailVerificationNoticeStatus() });
  }

  handleCloseNotice() {
    PilotModel.hideEmailVerificationNotice();
    this.setState({ isEmailVerificationNotice: false });
  }

  render() {
    if (this.props.error && this.props.error.type === errorTypes.AUTHENTICATION_ERROR) {
      return <Login isStayOnThisPage={true}/>;
    }

    return (
      <div>
        {this.state.isEmailVerificationNotice && (
          <EmailVerificationNotice isPadded={true} onClose={this.handleCloseNotice}/>
        )}
        {this.props.children}
      </div>
    );
  }
}


View.propTypes = {
  onStoreModified: func.isRequired,
  error: object
};
