'use strict';

const React = require('react');
const { shape, string } = React.PropTypes;
const Link = require('react-router').Link;

const Altitude = require('../../utils/altitude');
const FlightModel = require('../../models/flight');
const igcService = require('../../services/igc-service');
const itemViewMixin = require('../mixins/item-view-mixin');
const SiteModel = require('../../models/site');
const Util = require('../../utils/util');
const ZOOM_LEVEL = require('../../constants/map-constants').ZOOM_LEVEL;

const BreadCrumbs = require('../common/bread-crumbs');
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const RemarksRow = require('../common/section/remarks-row');
const RowContent = require('../common/section/row-content');
const Section = require('../common/section/section');
const SectionRow = require('../common/section/section-row');
const SectionTitle = require('../common/section/section-title');
const StaticMap = require('../common/maps/static-map');
const TrackMap = require('../common/maps/track-map');
const View = require('../common/view');

var FlightView = React.createClass({

    propTypes: {
        params: shape({ // url args
            id: string.isRequired
        }).isRequired
    },

    mixins: [ itemViewMixin(FlightModel.getModelKey()) ],
    
    renderMobileTopMenu: function() {
        return (
            <MobileTopMenu
                leftButtonCaption='Back'
                rightButtonCaption='Edit'
                onLeftClick={ this.handleGoToListView }
                onRightClick={ this.handleEditItem }
                />
        );
    },

    renderMap: function() {
        const igc = this.state.item.igc;
        if (!igc || typeof igc !== 'string') {
            return this.renderSiteMap();
        }

        const parsedIgc = igcService.parseIgc(this.state.item.igc);
        if (parsedIgc instanceof Error) {
            return this.renderSiteMap();
        }

        const trackCoords = parsedIgc.flightPoints.map(({ lat, lng }) => ({ lat, lng }));
        return TrackMap.create({
            trackCoords: trackCoords
        });
    },

    renderSiteMap: function() {
        var siteId = this.state.item.siteId;
        var siteCoordinates = SiteModel.getLatLng(siteId);
        // this flight has no site or the site has no coordinates
        if (siteCoordinates === null) {
            return null;
        }

        var site = SiteModel.getItemOutput(siteId);
        
        return StaticMap.create({
            center: siteCoordinates,
            zoomLevel: ZOOM_LEVEL.site,
            sites: [ site ]
        });
    },

    render: function() {
        if (this.state.loadingError) {
            return this.renderError();
        }

        if (this.state.item === null) {
            return this.renderLoader();
        }

        var { date, flightNumDay, numOfFlightsThatDay } = this.state.item;
        var flightName = `${date} (${flightNumDay}/${numOfFlightsThatDay})`;
        
        return (
            <View onStoreModified={ this.handleStoreModified }>
                { this.renderMobileTopMenu() }
                { this.renderNavigationMenu() }

                <Section onEditClick={ this.handleEditItem }>
                    <BreadCrumbs
                        elements={ [
                            <Link to='/flights'>Flights</Link>,
                            flightName
                        ] }
                        />

                    <SectionTitle>
                        <div>{ Util.formatDate(this.state.item.date) }</div>
                        <div>{ this.state.item.siteName }</div>
                    </SectionTitle>

                    <SectionRow>
                        <RowContent
                            label='Flight number:'
                            value={ [
                                Util.addOrdinalSuffix(this.state.item.flightNum),
                                ', in ',
                                Util.getDateYear(date),
                                ': ',
                                Util.addOrdinalSuffix(this.state.item.flightNumYear)
                            ].join('') }
                            />
                    </SectionRow>
                    
                    <SectionRow>
                        <RowContent
                            label='Max altitude:'
                            value={ Altitude.formatAltitude(this.state.item.altitude) }
                            />
                    </SectionRow>
                    
                    <SectionRow>
                        <RowContent
                            label='Above launch:'
                            value={ Altitude.formatAltitude(this.state.item.altitudeAboveLaunch) }
                            />
                    </SectionRow>
                    
                    <SectionRow>
                        <RowContent
                            label='Airtime:'
                            value={ Util.formatTime(this.state.item.airtime) }
                            />
                    </SectionRow>
                    
                    <SectionRow>
                        <RowContent
                            label='Glider:'
                            value={ Util.formatText(this.state.item.gliderName) }
                            />
                    </SectionRow>

                    <RemarksRow value={ this.state.item.remarks } />

                    { this.renderMap() }
                </Section>
            </View>
        );
    }
});


module.exports = FlightView;
