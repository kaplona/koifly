'use strict';

const React = require('react');
const { number } = React.PropTypes;

require('./days-since.less');


function DaysSinceLastFlight(props) {
    let daysSinceLastFlight = 'No flights yet';
    if (props.days) {
        daysSinceLastFlight = props.days + ' days since last flight';
    }
    if (props.days === 0) {
        daysSinceLastFlight = 'You had a blast today!';
    }

    const twoWeeks = 14;
    let className = 'days-since';
    if (typeof props.days === 'number' && props.days < twoWeeks) {
        className += ' x-green';
    }

    return (
        <div className={className}>
            {daysSinceLastFlight}
        </div>
    );
}

DaysSinceLastFlight.propTypes = {
    days: number
};


module.exports = DaysSinceLastFlight;
