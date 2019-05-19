'use strict';

const React = require('react');
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const NavigationMenu = require('../common/menu/navigation-menu');
const Notice = require('../common/notice/notice');


function EmailVerified() {
  return (
    <div>
      <MobileTopMenu header='Koifly'/>
      <NavigationMenu/>
      <Notice text='Thank you, you are now logged in and can continue working with Koifly!' type='success'/>
    </div>
  );
}


module.exports = EmailVerified;
