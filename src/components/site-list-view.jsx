'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var Link = ReactRouter.Link;
var SiteModel = require('../models/site');
var View = require('./common/view');
var Table = require('./common/table');
var Button = require('./common/button');
var Loader = require('./common/loader');
var FirstAdding = require('./common/first-adding');


var SiteListView = React.createClass({

    mixins: [ History ],

    getInitialState: function() {
        return {
            sites: null
        };
    },

    handleRowClick: function(siteId) {
        this.history.pushState(null, '/site/' + siteId);
    },

    handleSiteAdding: function() {
        this.history.pushState(null, '/site/0/edit');
    },

    onDataModified: function() {
        var sites = SiteModel.getSitesArray();
        this.setState({ sites: sites });
    },

    renderLoader: function() {
        return (this.state.sites === null) ? <Loader /> : '';
    },

    renderNoSitesYet: function() {
        return (
            <View onDataModified={ this.onDataModified }>
                <FirstAdding
                    dataType='sites'
                    onAdding={ this.handleSiteAdding }
                    />
            </View>
        );
    },

    render: function() {
        if (this.state.sites instanceof Array &&
            this.state.sites.length === 0
        ) {
            return this.renderNoSitesYet();
        }

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
            <View onDataModified={ this.onDataModified }>
                <div><Link to='/sites/map'>Show on Map</Link></div>
                <Table
                    columns={ columnsConfig }
                    rows={ this.state.sites }
                    initialSortingField='name'
                    onRowClick={ this.handleRowClick }
                    />
                { this.renderLoader() }
                <Link to='/site/0/edit'><Button>Add Site</Button></Link>
            </View>
        );
    }
});


module.exports = SiteListView;



