'use strict';

var React = require('react');
var PubSub = require('../../utils/pubsub');

var ErrorTypes = require('../../errors/error-types');
var PilotModel = require('../../models/pilot');

const STORE_MODIFIED_EVENT = require('../../constants/data-service-constants').STORE_MODIFIED_EVENT;

var EmailVerificationNotice = require('./notice/email-verification-notice');
var Login = require('../public-views/login');


var View = React.createClass({

    propTypes: {
        onStoreModified: React.PropTypes.func.isRequired,
        error: React.PropTypes.object
    },

    getInitialState: function() {
        return {
            isEmailVerificationNotice: false
        };
    },

    componentDidMount: function() {
        PubSub.on(STORE_MODIFIED_EVENT, this.handleStoreModified, this);
        this.handleStoreModified();
    },

    componentWillUnmount: function() {
        PubSub.removeListener(STORE_MODIFIED_EVENT, this.handleStoreModified, this);
    },

    handleStoreModified: function() {
        this.props.onStoreModified();
        this.setState({ isEmailVerificationNotice: PilotModel.getEmailVerificationNoticeStatus() });
    },

    handleCloseNotice: function() {
        PilotModel.hideEmailVerificationNotice();
        this.setState({ isEmailVerificationNotice: false });
    },

    renderNotice: function() {
        if (this.state.isEmailVerificationNotice) {
            return <EmailVerificationNotice isPadded={ true } onClose={ this.handleCloseNotice } />;
        }
    },

    render: function() {
        if (this.props.error && this.props.error.type === ErrorTypes.AUTHENTICATION_ERROR) {
            return <Login isStayOnThisPage={ true } />;
        }

        return (
            <div>
                { this.renderNotice() }
                { this.props.children }
            </div>
        );
    }
});

module.exports = View;
