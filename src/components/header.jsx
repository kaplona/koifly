'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

require('./koifly.css');

var Header = React.createClass({

    render: function() {
        return (
            <div className='header'>
                <Link to='/flight/0/edit' className='header__new_flight'>new flight</Link>
                <Link to='/' className='header__title'>Koifly</Link>
                <div className='header__menu'>
                    <Link to='/flights' className='header__menu__item'>Flights</Link>
                	<Link to='/sites' className='header__menu__item'>Sites</Link>
                	<Link to='/gliders' className='header__menu__item'>Gliders</Link>
                	<Link to='/pilot' className='header__menu__item'>Pilot</Link>
                </div>
            </div>
        );
    }
});

module.exports = Header;