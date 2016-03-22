'use strict';

var React = require('react');
var Link = require('react-router').Link;

const ZOOM_LEVEL = require('../../constants/map-constants').ZOOM_LEVEL;

var itemViewMixin = require('../mixins/item-view-mixin');
var FlightModel = require('../../models/flight');
var SiteModel = require('../../models/site');
var Util = require('../../utils/util');

var BreadCrumbs = require('../common/bread-crumbs');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var RemarksRow = require('../common/section/remarks-row');
var RowContent = require('../common/section/row-content');
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var SectionTitle = require('../common/section/section-title');
var StaticMap = require('../common/maps/static-map');
var View = require('../common/view');



var { shape, string } = React.PropTypes;

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
                onLeftClick={ this.handleToListView }
                onRightClick={ this.handleEditItem }
                />
        );
    },

    renderMap: function() {
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
        if (this.state.loadingError !== null) {
            return this.renderError();
        }

        if (this.state.item === null) {
            return this.renderLoader();
        }

        var { date, flightNum, flightNumDay, numOfFlightsThatDay, flightNumYear } = this.state.item;
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
                            value={ `${flightNum} ( ${Util.addOrdinalSuffix(flightNumYear)} for the year )` }
                            />
                    </SectionRow>
                    
                    <SectionRow>
                        <RowContent
                            label='Max altitude:'
                            value={ `${this.state.item.altitude} ${this.state.item.altitudeUnit}` }
                            />
                    </SectionRow>
                    
                    <SectionRow>
                        <RowContent
                            label='Above the launch:'
                            value={ `${this.state.item.altitudeAboveLaunch} ${this.state.item.altitudeUnit}` }
                            />
                    </SectionRow>
                    
                    <SectionRow>
                        <RowContent
                            label='Airtime:'
                            value={ Util.hoursMinutes(this.state.item.airtime) }
                            />
                    </SectionRow>
                    
                    <SectionRow>
                        <RowContent
                            label='Glider:'
                            value={ this.state.item.gliderName }
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
