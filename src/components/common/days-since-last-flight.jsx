'use strict';

const React = require('react');
const {number} = React.PropTypes;

require('./days-since.less');


const DaysSinceLastFlight = React.createClass({
  propTypes: {
    days: number
  },

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
});


module.exports = DaysSinceLastFlight;
