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
        PubSub.on('storeModified', this.handleStoreModified, this);
        this.handleStoreModified();
    },

    componentWillUnmount: function() {
        PubSub.removeListener('storeModified', this.handleStoreModified, this);
    },

    handleStoreModified: function() {
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
                <a className='logo' href='/' >Koifly</a>
                <Link to='/login' className='logout' onClick={ loginHandler } >{ loginText }</Link>
            </div>
        );
    }
});

module.exports = Header;
