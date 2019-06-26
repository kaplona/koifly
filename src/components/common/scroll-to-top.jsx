'use strict';

import React from 'react';
import { withRouter } from 'react-router';
import DomUtil from '../../utils/dom-util';


class ScrollToTop extends React.Component {
  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      DomUtil.scrollToTheTop();
    }
  }

  render() {
    return this.props.children;
  }
}

export default withRouter(ScrollToTop);
