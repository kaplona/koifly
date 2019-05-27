'use strict';

import React from 'react';
import MobileTopMenu from '../common/menu/mobile-top-menu';
import NavigationMenu from '../common/menu/navigation-menu';
import Notice from '../common/notice/notice';


export default function PageNotFound() {
  return (
    <div>
      <MobileTopMenu header='Koifly'/>
      <NavigationMenu isMobile={true}/>
      <Notice text='Oops! Page not found' type='error'/>
    </div>
  );
}
