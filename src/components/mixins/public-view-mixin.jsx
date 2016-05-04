'use strict';

var React = require('react');

var PublicLinksMixin = require('./public-links-mixin');

var NavigationMenu = require('../common/menu/navigation-menu');
var Notice = require('../common/notice/notice');


var PublicViewMixin = {

    mixins: [ PublicLinksMixin ],

    getInitialState: function() {
        return {
            isInputInFocus: false
        };
    },

    handleInputChange: function(inputName, inputValue) {
        this.setState({ [inputName]: inputValue });
    },

    handleInputFocus: function() {
        this.setState({ isInputInFocus: true });
    },

    handleInputBlur: function() {
        this.setState({ isInputInFocus: false });
    },

    updateError: function(error) {
        this.setState({
            error: error,
            isSending: false
        });
    },

    renderNavigationMenu: function() {
        return (
            <NavigationMenu
                isMobile={ true }
                isPositionFixed={ !this.state.isInputInFocus }
                />
        );
    },

    renderError: function() {
        if (this.state.error) {
            return <Notice type='error' text={ this.state.error.message } />;
        }
    }
};


module.exports = PublicViewMixin;
