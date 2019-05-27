'use strict';

import React from 'react';
import MobileTopMenu from '../common/menu/mobile-top-menu';
import NavigationMenu from '../common/menu/navigation-menu';
import navigationService from '../../services/navigation-service';
import Notice from '../common/notice/notice';


export default function InvalidVerificationLink() {
  return (
    <div>
      <MobileTopMenu
        header='Koifly'
        rightButtonCaption='Log in'
        onRightClick={navigationService.goToLogin}
      />
      <NavigationMenu isMobile={true}/>

      <Notice text='Verification link is invalid or expired' type='error'/>
    </div>
  );
}
