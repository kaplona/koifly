import React from 'react';
import dataServiceConstants from '../../constants/data-service-constants';
import MobileTopMenu from '../common/menu/mobile-top-menu';
import NavigationMenu from '../common/menu/navigation-menu';
import navigationService from '../../services/navigation-service';
import Notice from '../common/notice/notice';
import PilotModel from '../../models/pilot';
import PubSub from '../../utils/pubsub';


export default class InvalidVerificationLink extends React.Component {
  constructor(props) {
    super(props);

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
      .then(() => navigationService.goToLogin())
      .catch(() => window.alert('Server error. Could not log out.'));
  }

  render() {
    const loginText = this.state.isLoggedIn ? 'Log Out' : 'Log In';
    const loginHandler = this.state.isLoggedIn ? this.handleLogOut : navigationService.goToLogin;

    return (
      <div>
        {this.state.isLoggedIn && (
          <NavigationMenu />
        )}

        <MobileTopMenu
          header='Koifly'
          rightButtonCaption={loginText}
          onRightClick={loginHandler}
        />

        <Notice text='Verification link is invalid or expired' type='error'/>

        {this.state.isLoggedIn && (
          <NavigationMenu isMobile={true}/>
        )}
      </div>
    );
  }
}
