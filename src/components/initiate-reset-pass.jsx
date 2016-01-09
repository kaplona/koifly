'use strict';

var React = require('react');
var DataService = require('../services/data-service');
var Button = require('./common/button');
var TextInput = require('./common/inputs/text-input');
var Notice = require('./common/notice/notice');
var ErrorBox = require('./common/notice/error-box');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');


var InitiateResetPass = React.createClass({

    getInitialState: function() {
        return {
            email: null,
            error: null,
            isSending: false,
            isEmailSent: false
        };
    },

    handleSubmit: function(event) {
        if (event) {
            event.preventDefault();
        }

        if (this.state.email === null || this.state.email.trim() === '') {
            return this.handleSavingError(new KoiflyError(ErrorTypes.VALIDATION_FAILURE, 'Enter your email address'));
        }

        this.setState({
            isSending: true,
            error: null
        });

        DataService.initiateResetPass(this.state.email).then(() => {
            this.setState({
                isSending: false,
                isEmailSent: true
            });
        }).catch((error) => {
            this.handleSavingError(error);
        });
    },

    handleInputChange: function(inputName, inputValue) {
        this.setState({ [inputName]: inputValue });
    },

    handleSavingError: function(error) {
        this.setState({
            error: error,
            isSending: false
        });
    },

    renderNotice: function() {
        if (this.state.isEmailSent) {
            var noticeText = 'Email with reset password link was successfully sent to ' + this.state.email;
            return <Notice text={ noticeText } />;
        }
    },

    renderError: function() {
        if (this.state.error !== null) {
            return <ErrorBox error={ this.state.error } />;
        }
    },

    render: function() {
        return (
            <div>
                { this.renderNotice() }
                { this.renderError() }
                <form>
                    <TextInput
                        inputValue={ this.state.email }
                        labelText='Email:'
                        inputName='email'
                        onChange={ this.handleInputChange }
                        />

                    <Button type='submit' onClick={ this.handleSubmit } isEnabled={ !this.state.isSending }>
                        { this.state.isSending ? 'Sending...' : 'Send' }
                    </Button>
                </form>
            </div>
        );
    }
});


module.exports = InitiateResetPass;
