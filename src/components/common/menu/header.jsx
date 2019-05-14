'use strict';

const React = require('react');
const PilotModel = require('../../../models/pilot');
const PubSub = require('../../../utils/pubsub');
const PublicLinksMixin = require('../../mixins/public-links-mixin');

const STORE_MODIFIED_EVENT = require('../../../constants/data-service-constants').STORE_MODIFIED_EVENT;

require('./header.less');


const Header = React.createClass({

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
        const loginText = this.state.isLoggedIn ? 'Log Out' : 'Log In';
        const loginHandler = this.state.isLoggedIn ? this.handleLogOut : this.handleGoToLogin;

        return (
            <div className='main-header desktop'>
                <div className='logo'>
                    <a onClick={this.handleGoToHomePage} >Koifly</a>
                </div>
                <a className='logout' onClick={loginHandler} >{loginText}</a>
            </div>
        );
    }
});

module.exports = Header;
