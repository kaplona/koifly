'use strict';

var React = require('react');
var _ = require('lodash');

var editViewMixin = require('../mixins/edit-view-mixin');
var FlightModel = require('../../models/flight');
var GliderModel = require('../../models/glider');
var SiteModel = require('../../models/site');

var AltitudeInput = require('../common/inputs/altitude-input');
var DateInput = require('../common/inputs/date-input');
var DropdownInput = require('../common/inputs/dropdown-input');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var RemarksInput = require('../common/inputs/remarks-input');
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var SectionTitle = require('../common/section/section-title');
var TimeInput = require('../common/inputs/time-input');
var View = require('../common/view');



var { shape, string } = React.PropTypes;

var FlightEditView = React.createClass({

    propTypes: {
        params: shape({ // url args
            id: string
        })
    },

    mixins: [ editViewMixin(FlightModel.getModelKey()) ],

    getInitialState: function() {
        return {
            validationErrors: _.clone(FlightEditView.formFields)
        };
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

        var sites = SiteModel.getSiteValueTextList();
        var gliders = GliderModel.getGliderValueTextList();

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
                                labelText={ <span>Date<sup>*</sup>:</span> }
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

                        <SectionRow isLast={ true }>
                            <RemarksInput
                                inputValue={ this.state.item.remarks }
                                labelText='Remarks:'
                                errorMessage={ this.state.validationErrors.remarks }
                                onChange={ this.handleInputChange }
                                onFocus={ this.handleInputFocus }
                                onBlur={ this.handleInputBlur }
                                />
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
