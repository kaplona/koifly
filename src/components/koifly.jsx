'use strict';

const React = require('react');
const Header = require('./common/menu/header');


const Koifly = React.createClass({
    render() {
        return (
            <div className='content'>
                <Header/>
                {this.props.children}
            </div>
        );
    }
});

module.exports = Koifly;
