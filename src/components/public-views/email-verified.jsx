'use strict';

import React from 'react';
import MobileTopMenu from '../common/menu/mobile-top-menu';
import NavigationMenu from '../common/menu/navigation-menu';
import Notice from '../common/notice/notice';


export default function EmailVerified() {
  return (
    <div>
      <MobileTopMenu header='Koifly'/>
      <NavigationMenu/>
      <Notice text='Thank you, you are now logged in and can continue working with Koifly!' type='success'/>
    </div>
  );
}
