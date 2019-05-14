'use strict';

const React = require('react');
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const NavigationMenu = require('../common/menu/navigation-menu');
const Notice = require('../common/notice/notice');


function noPage() {
    return (
        <div>
            <MobileTopMenu header='Koifly' />
            <NavigationMenu isMobile={true} />
            <Notice
                text='Oops! Page not found'
                type='error'
            />
        </div>
    );
}


module.exports = noPage;
