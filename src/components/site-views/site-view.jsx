'use strict';

var React = require('react');
var Router = require('react-router');
var History = Router.History;
var Link = Router.Link;

const ZOOM_LEVEL = require('../../constants/map-constants').ZOOM_LEVEL;

var SiteModel = require('../../models/site');

var BreadCrumbs = require('../common/bread-crumbs');
var ErrorBox = require('../common/notice/error-box');
var Loader = require('../common/loader');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var RemarksRow = require('../common/section/remarks-row');
var RowContent = require('../common/section/row-content');
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var SectionTitle = require('../common/section/section-title');
var StaticMap = require('../common/maps/static-map');
var View = require('../common/view');


var SiteView = React.createClass({

    propTypes: {
        params: React.PropTypes.shape({ // url args
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
                <MobileTopMenu
                    leftButtonCaption='Back'
                    onLeftClick={ this.handleToSiteList }
                    />
                <NavigationMenu isSiteView={ true } />

                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleDataModified } />
            </View>
        );
    },

    renderLoader: function() {
        return (
            <View onDataModified={ this.handleDataModified }>
                <MobileTopMenu
                    leftButtonCaption='Back'
                    onLeftClick={ this.handleToSiteList }
                    />
                <NavigationMenu isSiteView={ true } />

                <Loader />
            </View>
        );
    },

    renderMap: function() {
        if (this.state.site.coordinates) {
            return StaticMap.create({
                center: SiteModel.getLatLngCoordinates(this.state.site.id),
                zoomLevel: ZOOM_LEVEL.site,
                sites: [ this.state.site ]
            });
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
                <MobileTopMenu
                    leftButtonCaption='Back'
                    rightButtonCaption='Edit'
                    onLeftClick={ this.handleToSiteList }
                    onRightClick={ this.handleSiteEditing }
                    />
                <NavigationMenu isSiteView={ true } />

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
            </View>
        );
    }
});



module.exports = SiteView;
