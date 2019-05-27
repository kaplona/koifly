'use strict';

import React from 'react';
import { number } from 'prop-types';

require('./days-since-last-flight.less');


// defined as class for testing purposes
export default class DaysSinceLastFlight extends React.Component {
  render() {
    let daysSinceLastFlight = 'No flights yet';
    if (this.props.days) {
      daysSinceLastFlight = this.props.days + ' days since last flight';
    }
    if (this.props.days === 0) {
      daysSinceLastFlight = 'You had a blast today!';
    }

    const twoWeeks = 14;
    let className = 'days-since';
    if (typeof this.props.days === 'number' && this.props.days < twoWeeks) {
      className += ' x-green';
    }

    return (
      <div className={className}>
        {daysSinceLastFlight}
      </div>
    );
  }
}


DaysSinceLastFlight.propTypes = {
  days: number
};
