'use strict';

var React = require('react');

require('./days-since.less');


var DaysSinceLastFlight = React.createClass({

    propTypes: {
        days: React.PropTypes.number
    },

    render: function() {
        var daysSinceLastFlight;
        if (this.props.days) {
            daysSinceLastFlight = this.props.days + ' days since last flight';
        } else {
            daysSinceLastFlight = 'no flights yet';
        }

        return (
            <div className='days-since'>
                { daysSinceLastFlight }
            </div>
        );
    }
});


module.exports = DaysSinceLastFlight;
