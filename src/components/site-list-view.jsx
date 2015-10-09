'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var PubSub = require('../models/pubsub');
var SiteModel = require('../models/site');
var Table = require('./common/table');
var Button = require('./common/button');
var Loader = require('./common/loader');


var SiteListView = React.createClass({

    getInitialState: function() {
        return {
            sites: null
        };
    },

    componentDidMount: function() {
        PubSub.on('dataModified', this.onDataModified, this);
        this.onDataModified();
    },

    componentWillUnmount: function() {
        PubSub.removeListener('dataModified', this.onDataModified, this);
    },

    onDataModified: function() {
        var sites = SiteModel.getSitesArray();
        this.setState({ sites: sites });
    },

    renderLoader: function() {
        return (this.state.sites === null) ? <Loader /> : '';
    },

    render: function() {
        var columnsConfig = [
            {
                key: 'name',
                label: 'Name',
                defaultSortingDirection: true
            },
            {
                key: 'location',
                label: 'Location',
                defaultSortingDirection: true
            },
            {
                key: 'launchAltitude',
                label: 'Altitude',
                defaultSortingDirection: false
            }
        ];

        return (
            <div>
                <div><Link to='/sites/map'>Show on Map</Link></div>
                <Table
                    columns={ columnsConfig }
                    rows={ this.state.sites }
                    initialSortingField='name'
                    urlPath='/site/' />
                { this.renderLoader() }
                <Link to='/site/0/edit'><Button>Add Site</Button></Link>
            </div>
        );
    }
});


module.exports = SiteListView;



