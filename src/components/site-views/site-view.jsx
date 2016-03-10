'use strict';

var React = require('react');
var Router = require('react-router');
var History = Router.History;
var Link = Router.Link;
var Map = require('../../utils/map');
var SiteModel = require('../../models/site');
var View = require('./../common/view');
var TopMenu = require('../common/menu/top-menu');
var BottomMenu = require('../common/menu/bottom-menu');
var BreadCrumbs = require('../common/bread-crumbs');
var Section = require('../common/section/section');
var SectionTitle = require('../common/section/section-title');
var SectionRow = require('../common/section/section-row');
var RowContent = require('../common/section/row-content');
var RemarksRow = require('../common/section/remarks-row');
var StaticMap = require('../common/maps/static-map');
var Loader = require('../common/loader');
var ErrorBox = require('../common/notice/error-box');


var SiteView = React.createClass({

    propTypes: {
        params: React.PropTypes.shape({
            siteId: React.PropTypes.string.isRequired
        })
    },

    mixins: [ History ],

    getInitialState: function() {
        return {
            site: null,
            loadingError: null
        };
    },

    handleToSiteList: function() {
        this.history.pushState(null, '/sites');
    },

    handleSiteEditing: function() {
        this.history.pushState(null, '/site/' + this.props.params.siteId + '/edit');
    },

    handleDataModified: function() {
        var site = SiteModel.getSiteOutput(this.props.params.siteId);
        if (site !== null && site.error) {
            this.setState({ loadingError: site.error });
        } else {
            this.setState({
                site: site,
                loadingError: null
            });
        }
    },

    renderError: function() {
        return (
            <View onDataModified={ this.handleDataModified } error={ this.state.loadingError }>
                <TopMenu
                    leftText='Back'
                    onLeftClick={ this.handleToSiteList }
                    />
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleDataModified }/>
                <BottomMenu isSiteView={ true } />
            </View>
        );
    },

    renderLoader: function() {
        return (
            <View onDataModified={ this.handleDataModified }>
                <TopMenu
                    leftText='Back'
                    onLeftClick={ this.handleToSiteList }
                    />
                <Loader />
                <BottomMenu isSiteView={ true } />
            </View>
        );
    },

    renderMap: function() {
        if (this.state.site.coordinates) {
            var siteList = [ this.state.site ];
            return (
                <StaticMap
                    center={ SiteModel.getLatLngCoordinates(this.state.site.id) }
                    zoomLevel={ Map.zoomLevel.site }
                    markers={ siteList }
                    />
            );
        }
    },

    render: function() {
        if (this.state.loadingError !== null) {
            return this.renderError();
        }

        if (this.state.site === null) {
            return this.renderLoader();
        }

        return (
            <View onDataModified={ this.handleDataModified }>
                <TopMenu
                    leftText='Back'
                    rightText='Edit'
                    onLeftClick={ this.handleToSiteList }
                    onRightClick={ this.handleSiteEditing }
                    />

                <Section onEditClick={ this.handleSiteEditing }>
                    <BreadCrumbs
                        elements={ [
                            <Link to='/sites'>Sites</Link>,
                            this.state.site.name
                        ] }
                        />

                    <SectionTitle>
                        { this.state.site.name }
                    </SectionTitle>

                    <SectionRow>
                        <RowContent
                            label='Location:'
                            value={ this.state.site.location }
                            />
                    </SectionRow>
                    <SectionRow>
                        <RowContent
                            label='Launch altitude:'
                            value={ this.state.site.launchAltitude + ' ' + this.state.site.altitudeUnit }
                            />
                    </SectionRow>
                    <SectionRow>
                        <RowContent
                            label='Coordinates:'
                            value={ this.state.site.coordinates }
                            />
                    </SectionRow>
                    <SectionRow>
                        <RowContent
                            label='Flights:'
                            value={ [
                                this.state.site.flightNum,
                                '( this year:',
                                this.state.site.flightNumThisYear,
                                ')'
                            ].join(' ') }
                            />
                    </SectionRow>

                    <RemarksRow value={ this.state.site.remarks } />

                    { this.renderMap() }
                </Section>

                <BottomMenu isSiteView={ true } />
            </View>
        );
    }
});



module.exports = SiteView;
