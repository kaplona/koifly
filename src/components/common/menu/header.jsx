'use strict';

var React = require('react');
var Link = require('react-router').Link;
var PubSub = require('../../../utils/pubsub');
var PilotModel = require('../../../models/pilot');

require('./header.less');


var Header = React.createClass({

    getInitialState: function() {
        return { isLoggedIn: false };
    },

    componentDidMount: function() {
        PubSub.on('dataModified', this.handleDataModified, this);
        this.handleDataModified();
    },

    componentWillUnmount: function() {
        PubSub.removeListener('dataModified', this.handleDataModified, this);
    },

    handleDataModified: function() {
        this.setState({ isLoggedIn: PilotModel.isLoggedIn() });
    },

    handleLogOut: function() {
        PilotModel.logout();
    },

    render: function() {
        var loginText = this.state.isLoggedIn ? 'Log Out' : 'Log In';
        var loginHandler = this.state.isLoggedIn ? this.handleLogOut : null;

        return (
            <div className='main-header desktop'>
                <div className='logo'>
                    <a href='/' >Koifly</a>
                </div>
                <div className='logout'>
                    <Link to='/login' onClick={ loginHandler } >{ loginText }</Link>
                </div>
            </div>
        );
    }
});

module.exports = Header;
