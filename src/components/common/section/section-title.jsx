import React from 'react';
import { bool } from 'prop-types';

require('./section-title.less');


// defined as class for testing purposes
export default class SectionTitle extends React.Component {
  render() {
    let className = 'section-title';
    if (this.props.isSubtitle) {
      className += ' x-subtitle';
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


SectionTitle.defaultProps = {
  isDesktopOnly: false,
  isSubtitle: false
};

SectionTitle.propTypes = {
  isDesktopOnly: bool,
  isSubtitle: bool
};
