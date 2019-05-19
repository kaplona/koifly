'use strict';

const React = require('react');
const {func, string} = React.PropTypes;
const browserHistory = require('react-router').browserHistory;

require('./app-link.less');


/**
 * If component has "href" prop, when user clicks on a link:
 * 1) new page state will be pushed to the router
 * 2) or new page will be opened in new tab if Command or Ctrl key were pressed
 *
 * If component has only onClick prop, it will be invoked on a link click.
 */
const AppLink = React.createClass({

  propTypes: {
    href: string,
    onClick: func // will be ignored if "href" prop is passed.
  },

  handleClick: function (e) {
    if (e && (e.ctrlKey || e.metaKey) && this.props.href) {
      // Allow default link behaviour when user opens it with Command or Ctrl key pressed.
      return;
    }

    if (e) {
      e.preventDefault();
    }

    if (this.props.href) {
      browserHistory.push(this.props.href);
      return;
    }

    if (this.props.onClick) {
      this.props.onClick();
    }
  },

  render: function () {
    return (
      <a href={this.props.href} className='app-link' onClick={this.handleClick}>
        {this.props.children}
      </a>
    );
  }
});


module.exports = AppLink;
