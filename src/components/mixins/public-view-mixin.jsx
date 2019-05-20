'use strict';

const React = require('react');
const NavigationMenu = require('../common/menu/navigation-menu');
const Notice = require('../common/notice/notice');
const PublicLinksMixin = require('./public-links-mixin');


const PublicViewMixin = {

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
        isMobile={true}
        isPositionFixed={!this.state.isInputInFocus}
      />
    );
  },

  renderError: function() {
    if (this.state.error) {
      return <Notice isPadded={true} type='error' text={this.state.error.message}/>;
    }
  }
};


module.exports = PublicViewMixin;
