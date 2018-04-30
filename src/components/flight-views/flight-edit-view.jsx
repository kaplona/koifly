'use strict';

const React = require('react');
const { shape, string } = React.PropTypes;
const _ = require('lodash');
const Altitude = require('../../utils/altitude');
const editViewMixin = require('../mixins/edit-view-mixin');
const FlightModel = require('../../models/flight');
const GliderModel = require('../../models/glider');
const SiteModel = require('../../models/site');
const Util = require('../../utils/util');

const AltitudeInput = require('../common/inputs/altitude-input');
const DateInput = require('../common/inputs/date-input');
const DropdownInput = require('../common/inputs/dropdown-input');
const FightTrackUpload = require('./flight-track-upload');
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const RemarksInput = require('../common/inputs/remarks-input');
const Section = require('../common/section/section');
const SectionRow = require('../common/section/section-row');
const SectionTitle = require('../common/section/section-title');
const TimeInput = require('../common/inputs/time-input');
const View = require('../common/view');


const FlightEditView = React.createClass({

    propTypes: {
        params: shape({ // url args
            id: string
        })
    },

    mixins: [ editViewMixin(FlightModel.getModelKey()) ],

    getInitialState: function() {
        return {
            validationErrors: _.clone(FlightEditView.formFields),
            isSledRide: false
        };
    },
    
    handleSledRide: function(isSledRide) {
        if (!isSledRide) {
            this.setState({ isSledRide: false });
            return;
        }
        
        let altitude = this.state.item.altitude;
        let altitudeUnit = this.state.item.altitudeUnit;
        if (this.state.item.siteId) {
            altitude = SiteModel.getLaunchAltitude(this.state.item.siteId).toString();
            altitudeUnit = Altitude.getUserAltitudeUnit();
        }
        
        const item = _.extend({}, this.state.item, { altitude: altitude, altitudeUnit: altitudeUnit });
        
        this.setState({
            item: item,
            isSledRide: true
        });
    },

    handleFlightTrackData: function(flightTrackData, igcFileContent) {
        const { altitude, hours, minutes } = this.state.item;
        const newAltitude = (!altitude && flightTrackData.maxAltitude) ? flightTrackData.maxAltitude : altitude;
        const flightTrackHoursMinutes = Util.getHoursMinutes(flightTrackData.airtime);
        const newHours = (!hours && !minutes && flightTrackData.airtime) ? flightTrackHoursMinutes.hours : hours;
        const newMinutes = (!hours && !minutes && flightTrackData.airtime) ? flightTrackHoursMinutes.minutes : minutes;

        const newItem = _.extend({}, this.state.item, {
            altitude: newAltitude,
            hours: newHours,
            minutes: newMinutes,
            igcFileContent
        });

        this.setState({ item: newItem }, () => {
            this.updateValidationErrors(this.getValidationErrors(true));
        });
    },
    
    renderMobileTopMenu: function() {
        return (
            <MobileTopMenu
                leftButtonCaption='Cancel'
                rightButtonCaption='Save'
                onLeftClick={ this.handleCancelEdit }
                onRightClick={ this.handleSubmit }
                isPositionFixed={ !this.state.isInputInFocus }
                />
        );
    },

    render: function() {
        if (this.state.loadingError) {
            return this.renderLoadingError();
        }

        if (this.state.item === null) {
            return this.renderLoader();
        }

        const sites = SiteModel.getSiteValueTextList();
        const gliders = GliderModel.getGliderValueTextList();

        return (
            <View onStoreModified={ this.handleStoreModified } error={ this.state.loadingError }>
                { this.renderMobileTopMenu() }

                <form>
                    { this.renderProcessingError() }

                    <Section>
                        <SectionTitle>
                            Edit Flight
                        </SectionTitle>
                        
                        <SectionRow>
                            <DateInput
                                inputValue={ this.state.item.date }
                                labelText='Date*:'
                                inputName='date'
                                errorMessage={ this.state.validationErrors.date }
                                onChange={ this.handleInputChange }
                                onFocus={ this.handleInputFocus }
                                onBlur={ this.handleInputBlur }
                                />
                        </SectionRow>

                        <SectionRow>
                            <DropdownInput
                                selectedValue={ this.state.item.siteId || '0' }
                                options={ sites }
                                labelText='Site:'
                                inputName='siteId'
                                emptyValue={ '0' }
                                errorMessage={ this.state.validationErrors.siteId }
                                onChangeFunc={ (inputName, inputValue) => {
                                    this.handleInputChange(inputName, inputValue === '0' ? null : inputValue);
                                } }
                                onFocus={ this.handleInputFocus }
                                onBlur={ this.handleInputBlur }
                                />
                        </SectionRow>

                        <SectionRow>
                            <AltitudeInput
                                inputValue={ this.state.item.altitude }
                                selectedAltitudeUnit={ this.state.item.altitudeUnit }
                                labelText='Max altitude:'
                                errorMessage={ this.state.validationErrors.altitude }
                                onChange={ this.handleInputChange }
                                onFocus={ this.handleInputFocus }
                                onBlur={ this.handleInputBlur }
                                onSledRide={ this.handleSledRide }
                                isSledRide={ this.state.isSledRide }
                                />
                        </SectionRow>

                        <SectionRow>
                            <TimeInput
                                hours={ this.state.item.hours }
                                minutes={ this.state.item.minutes }
                                labelText='Airtime:'
                                errorMessage={
                                    this.state.validationErrors.airtime ||
                                    this.state.validationErrors.hours ||
                                    this.state.validationErrors.minutes
                                }
                                onChange={ this.handleInputChange }
                                onFocus={ this.handleInputFocus }
                                onBlur={ this.handleInputBlur }
                                />
                        </SectionRow>

                        <SectionRow>
                            <DropdownInput
                                selectedValue={ this.state.item.gliderId || '0' }
                                options={ gliders }
                                labelText='Glider:'
                                inputName='gliderId'
                                emptyValue={ '0' }
                                errorMessage={ this.state.validationErrors.gliderId }
                                onChangeFunc={ (inputName, inputValue) => {
                                    this.handleInputChange(inputName, inputValue === '0' ? null : inputValue);
                                } }
                                onFocus={ this.handleInputFocus }
                                onBlur={ this.handleInputBlur }
                                />
                        </SectionRow>

                        <SectionRow>
                            <RemarksInput
                                inputValue={ this.state.item.remarks }
                                labelText='Remarks:'
                                errorMessage={ this.state.validationErrors.remarks }
                                onChange={ this.handleInputChange }
                                onFocus={ this.handleInputFocus }
                                onBlur={ this.handleInputBlur }
                                />
                        </SectionRow>

                        <SectionTitle isSubtitle={ true }>
                            Upload IGC:
                        </SectionTitle>

                        <SectionRow isLast={ true }>
                            <FightTrackUpload onLoad={ this.handleFlightTrackData } />
                        </SectionRow>

                        { this.renderDesktopButtons() }

                    </Section>

                    { this.renderMobileButtons() }

                </form>

                { this.renderNavigationMenu() }
            </View>
        );
    }
});


FlightEditView.formFields = {
    date: null,
    siteId: null,
    altitude: null,
    airtime: null,
    gliderId: null,
    remarks: null,
    hours: null,
    minutes: null
};


module.exports = FlightEditView;
