'use strict';

var React = require('react');
var PubSub = require('../../utils/pubsub');

var View = React.createClass({
    propTypes: {
        onDataModified: React.PropTypes.func
    },

    componentDidMount: function() {
        PubSub.on('dataModified', this.handleDataModified, this);
        this.handleDataModified();
    },

    componentWillUnmount: function() {
        PubSub.removeListener('dataModified', this.handleDataModified, this);
    },

    handleDataModified: function() {
        this.props.onDataModified();
    },

    render: function() {
        return (
            <div>
                { this.props.children }
            </div>
        );
    }
});

module.exports = View;
