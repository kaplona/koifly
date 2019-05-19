'use strict';

const React = require('react');
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const NavigationMenu = require('../common/menu/navigation-menu');
const Notice = require('../common/notice/notice');
const PublicLinksMixin = require('../mixins/public-links-mixin');


const InvalidVerificationLink = React.createClass({

  mixins: [PublicLinksMixin],

  render: function () {
    return (
      <div>
        <MobileTopMenu
          header='Koifly'
          rightButtonCaption='Log in'
          onRightClick={this.handleGoToLogin}
        />
        <NavigationMenu isMobile={true}/>

        <Notice text='Verification link is invalid or expired' type='error'/>
      </div>
    );
  }
});


module.exports = InvalidVerificationLink;
