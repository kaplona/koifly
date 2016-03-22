'use strict';

var React = require('react');

require('./days-since.less');


var DaysSinceLastFlight = React.createClass({

    propTypes: {
        days: React.PropTypes.number
    },

    render: function() {
        var daysSinceLastFlight = 'No flights yet';
        if (this.props.days) {
            daysSinceLastFlight = this.props.days + ' days since last flight';
        }
        if (this.props.days === 0) {
            daysSinceLastFlight = 'You had a blast today!';
        }
        
        var twoWeeks = 14;
        var className = 'days-since';
        if (typeof this.props.days === 'number' && this.props.days < twoWeeks) {
            className += ' x-green';
        }

        return (
            <div className={ className }>
                { daysSinceLastFlight }
            </div>
        );
    }
});


module.exports = DaysSinceLastFlight;
