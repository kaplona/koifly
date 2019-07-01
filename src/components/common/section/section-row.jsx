import React from 'react';
import { bool } from 'prop-types';

require('./section-row.less');


// defined as class for testing purposes
export default class SectionRow extends React.Component {
  render() {
    let className = 'section-row';
    if (this.props.isLast) {
      className += ' x-last';
    }
    if (this.props.isMobileLast) {
      className += ' x-mobile-last';
    }
    if (this.props.isDesktopOnly) {
      className += ' x-desktop';
    }

    return (
      <div className={className}>
        {this.props.children}
      </div>
    );
  }
}


SectionRow.defaultProps = {
  isDesktopOnly: false,
  isLast: false,
  isMobileLast: false
};

SectionRow.propTypes = {
  isDesktopOnly: bool,
  isLast: bool,
  isMobileLast: bool
};
