'use strict';

var React = require('react');
var PubSub = require('../../../utils/pubsub');

var PilotModel = require('../../../models/pilot');
var PublicLinksMixin = require('../../mixins/public-links-mixin');

const STORE_MODIFIED_EVENT = require('../../../constants/data-service-constants').STORE_MODIFIED_EVENT;

require('./header.less');


var Header = React.createClass({

    mixins: [ PublicLinksMixin ],

    getInitialState: function() {
        return { isLoggedIn: false };
    },

    componentDidMount: function() {
        PubSub.on(STORE_MODIFIED_EVENT, this.handleStoreModified, this);
        this.handleStoreModified();
    },

    componentWillUnmount: function() {
        PubSub.removeListener(STORE_MODIFIED_EVENT, this.handleStoreModified, this);
    },

    handleStoreModified: function() {
        this.setState({ isLoggedIn: PilotModel.isLoggedIn() });
    },

    handleLogOut: function() {
        PilotModel
            .logout()
            .then(() => this.handleGoToLogin)
            .catch(() => window.alert('Server error. Could not log out.'));
    },

    render: function() {
        var loginText = this.state.isLoggedIn ? 'Log Out' : 'Log In';
        var loginHandler = this.state.isLoggedIn ? this.handleLogOut : this.handleGoToLogin;

        return (
            <div className='main-header desktop'>
                <a className='logo' onClick={ this.handleGoToHomePage } >Koifly</a>
                <a className='logout' onClick={ loginHandler } >{ loginText }</a>
            </div>
        );
    }
});

module.exports = Header;
