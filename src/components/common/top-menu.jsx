'use strict';

var React = require('react');


var TopMenu = React.createClass({

    propTypes: {
        headerText: React.PropTypes.string,
        leftText: React.PropTypes.string,
        rightText: React.PropTypes.string,
        onLeftClick: React.PropTypes.func,
        onRightClick: React.PropTypes.func
    },

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
                    <Link
                        to={ loginLink }
                        onClick={ loginHandler }
                        className='header__menu__item'
                    >
                        { loginText }
                    </Link>
                </div>
            </div>
        );
    }
});

module.exports = TopMenu;
