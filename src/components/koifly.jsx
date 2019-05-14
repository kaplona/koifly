'use strict';

const React = require('react');
const Header = require('./common/menu/header');


function Koifly(props) {
    return (
        <div className='content'>
            <Header />
            {props.children}
        </div>
    );
}

module.exports = Koifly;
