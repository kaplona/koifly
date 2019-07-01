import React from 'react';
import dataServiceConstants from '../../../constants/data-service-constants';
import navigationService from '../../../services/navigation-service';
import PilotModel from '../../../models/pilot';
import PubSub from '../../../utils/pubsub';

require('./header.less');


export default class Header extends React.Component {
  constructor() {
    super();
    this.state = { isLoggedIn: false };

    this.handleLogOut = this.handleLogOut.bind(this);
  }

  componentDidMount() {
    PubSub.on(dataServiceConstants.STORE_MODIFIED_EVENT, this.handleStoreModified, this);
    this.handleStoreModified();
  }

  componentWillUnmount() {
    PubSub.removeListener(dataServiceConstants.STORE_MODIFIED_EVENT, this.handleStoreModified, this);
  }

  handleStoreModified() {
    this.setState({ isLoggedIn: PilotModel.isLoggedIn() });
  }

  handleLogOut() {
    PilotModel
      .logout()
      .then(() => navigationService.goToLogin)
      .catch(() => window.alert('Server error. Could not log out.'));
  }

  render() {
    const loginText = this.state.isLoggedIn ? 'Log Out' : 'Log In';
    const loginHandler = this.state.isLoggedIn ? this.handleLogOut : navigationService.goToLogin;

    return (
      <div className='main-header desktop'>
        <div className='logo'>
          <a onClick={navigationService.goToHomePage}>Koifly</a>
        </div>
        <a className='logout' onClick={loginHandler}>{loginText}</a>
      </div>
    );
  }
}
