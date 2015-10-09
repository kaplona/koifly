'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var _ = require('underscore');
var PubSub = require('../models/pubsub');
var Map = require('../models/map');
var SiteModel = require('../models/site');
var StaticMap = require('./common/static-map');
var Button = require('./common/button');
var Loader = require('./common/loader');


var SiteView = React.createClass({

    propTypes: {
        params: React.PropTypes.shape({
            siteId: React.PropTypes.string.isRequired
        })
    },

    getInitialState: function() {
        return {
            site: null
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
        var site = SiteModel.getSiteOutput(this.props.params.siteId);
        // TODO if no flight with given id => show error
        this.setState({ site: site });
    },

    renderLoader: function() {
        return (
            <div>
                <Link to='/sites'>Back to Sites</Link>
                <Loader />
                <div className='button__menu'>
                    <Link to={ '/site/' + this.props.params.siteId + '/edit' }>
                        <Button>Edit</Button>
                    </Link>
                    <Link to='/site/0/edit'><Button>Add Site</Button></Link>
                </div>
            </div>
        );
    },

    renderMap: function() {
        if (this.state.site.coordinates) {
            var site =  _.clone(this.state.site);
            var siteList = [];
            siteList.push(site);
            return (
                <StaticMap
                    center={ SiteModel.getLatLngCoordinates(site.id) }
                    zoomLevel={ Map.zoomLevel.site }
                    markers={ siteList } />
            );
        }
        return '';
    },

    render: function() {
        if (this.state.site === null) {
            return (<div>{ this.renderLoader() }</div>);
        }

        return (
            <div>
                <Link to='/sites'>Back to Sites</Link>
                <div className='container__title'>
                    { this.state.site.name }
                </div>
                <div className='container__subtitle'>
                    <div>Location: { this.state.site.location }</div>
                    <div>
                        Launch Altitude:
                        { this.state.site.launchAltitude + ' ' + this.state.site.altitudeUnits }
                    </div>
                    <div>Coordinates: { this.state.site.coordinates }</div>
                    {/* TODO add remarks to sites
                    <div>Remarks:</div>
                    <div>{ this.state.site.remarks }</div> */}
                </div>
                <div className='button__menu'>
                    <Link to={ '/site/' + this.props.params.siteId + '/edit' }><Button>Edit</Button></Link>
                    <Link to='/site/0/edit'><Button>Add Site</Button></Link>
                </div>
                { this.renderMap() }
            </div>
        );
    }
});



module.exports = SiteView;



