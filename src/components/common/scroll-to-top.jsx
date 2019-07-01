import React from 'react';
import { shape, string } from 'prop-types';
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


ScrollToTop.propTypes = {
  // Router injected props
  location: shape({
    pathname: string.isRequired
  }).isRequired
};

export default withRouter(ScrollToTop);
