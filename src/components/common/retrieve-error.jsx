'use strict';

var React = require('react');
var Button = require('./button');
var Loader = require('./loader');


var RetrieveError = React.createClass({
    propTypes: {
        onTryAgain: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return {
            timeoutId: null,
            waitingTime: 10,
            countdown: 10,
            issueWasReported: false,
            tryAgainInProcess: false
        };
    },

    componentDidMount: function() {
        // Start countdown
        this.countdown();
    },

    componentWillReceiveProps: function() {
        // Double waiting time
        // If waiting time more than 600 seconds stop countdown
        var newWaitingTime = null;
        if (this.state.waitingTime) {
            newWaitingTime = (this.state.waitingTime * 2) < 600 ? (this.state.waitingTime * 2) : null;
        }
        // Reset state
        // Start countdown
        this.setState({
            waitingTime: newWaitingTime,
            countdown: newWaitingTime,
            issueWasReported: false,
            tryAgainInProcess: false
        }, this.countdown);
    },

    componentWillUnmount: function() {
        // Stop countdown
        if (this.state.timeoutId) {
            clearTimeout(this.state.timeoutId);
        }
    },

    handleTryAgain: function() {
        // Stop countdown
        if (this.state.timeoutId) {
            clearTimeout(this.state.timeoutId);
        }
        // Show loader
        this.setState({ tryAgainInProcess: true });
        //DEV make it a second argument of setState
        // Trigger parent method
        setTimeout(this.props.onTryAgain, 2000);
    },

    handleReport: function() {
        //TODO Send report
        // Show report summary to user
        this.setState({ issueWasReported: true });
    },

    countdown: function() {
        // If waiting time exceeds the limit don't start countdown
        if (this.state.waitingTime === null) {
            return;
        }

        if (this.state.timeoutId) {
            clearTimeout(this.state.timeoutId);
        }

        var countdownComplete = (this.state.countdown === 0);
        if (countdownComplete) {
            this.handleTryAgain();
            return;
        }

        this.setState({
            timeoutId: setTimeout(this.countdown, 1000),
            countdown: (this.state.countdown - 1)
        });
    },

    renderCountdown: function() {
        // If waiting time doesn't exceed the limit show countdown
        if (this.state.waitingTime !== null) {
            return <div>Will try again in { this.state.countdown } seconds</div>;
        }
    },

    renderReport: function() {
        if (this.state.issueWasReported) {
            return <div>You successfully reported the issue</div>;
        }
        return <div><Button onClick={ this.handleReport }>Report</Button></div>;
    },

    render: function() {
        if (this.state.tryAgainInProcess) {
            return <Loader/>;
        }

        return (
            <div>
                Sorry, cannot load the data
                <div><Button onClick={ this.handleTryAgain }>Try Again</Button></div>
                { this.renderCountdown() }
                { this.renderReport() }
            </div>
        );
    }
});

module.exports = RetrieveError;
