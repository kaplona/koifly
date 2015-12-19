'use strict';

var React = require('react');
var Link = require('react-router').Link;
var PubSub = require('../utils/pubsub');
var DataService = require('../services/data-service');
var ErrorTypes = require('../utils/error-types');


var Header = React.createClass({

    getInitialState: function() {
        return { isLogged: false };
    },

    componentDidMount: function() {
        PubSub.on('dataModified', this.handleDataModified, this);
        this.handleDataModified();
    },

    componentWillUnmount: function() {
        PubSub.removeListener('dataModified', this.handleDataModified, this);
    },

    handleDataModified: function() {
        if (DataService.data.pilot && DataService.data.error !== ErrorTypes.AUTHENTICATION_FAILURE) {
            this.setState({ isLogged: true });
        }
    },

    handleLogOut: function() {
        DataService.logOut();
    },

    render: function() {
        var logInText = this.state.isLogged ? 'Log Out' : 'Log In';
        var logInLink = this.state.isLogged ? '/' : '/login';
        var logInHandler = this.state.isLogged ? this.handleLogOut : null;

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
                        to={ logInLink }
                        onClick={ logInHandler }
                        className='header__menu__item'
                        >
                        { logInText }
                    </Link>
                </div>
            </div>
        );
    }
});

module.exports = Header;
