'use strict';

var React = require('react');
var _ = require('lodash');

var Altitude = require('../../utils/altitude');
var editViewMixin = require('../mixins/edit-view-mixin');
var PilotModel = require('../../models/pilot');

var DropdownInput = require('../common/inputs/dropdown-input');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var SectionTitle = require('../common/section/section-title');
var TextInput = require('../common/inputs/text-input');
var TimeInput = require('../common/inputs/time-input');
var View = require('../common/view');


var PilotEditView = React.createClass({

    mixins: [ editViewMixin(PilotModel.getModelKey()) ],

    getInitialState: function() {
        return {
            validationErrors: _.clone(PilotEditView.formFields)
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

        return (
            <View onStoreModified={ this.handleStoreModified } error={ this.state.loadingError }>
                { this.renderMobileTopMenu() }

                <form>
                    { this.renderProcessingError() }
                    
                    <Section>
                        <SectionTitle>
                            { this.state.item.email }
                        </SectionTitle>

                        <SectionRow>
                            <TextInput
                                inputValue={ this.state.item.userName }
                                labelText='Name:'
                                inputName='userName'
                                errorMessage={ this.state.validationErrors.userName }
                                onChange={ this.handleInputChange }
                                onFocus={ this.handleInputFocus }
                                onBlur={ this.handleInputBlur }
                                />
                        </SectionRow>

                        <SectionTitle isSubtitle={ true }>
                            My achievements before Koifly:
                        </SectionTitle>

                        <SectionRow>
                            <TextInput
                                inputValue={ this.state.item.initialFlightNum }
                                labelText='Number of flights:'
                                inputName='initialFlightNum'
                                isNumber={ true }
                                errorMessage={ this.state.validationErrors.initialFlightNum }
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
                                    this.state.validationErrors.initialAirtime ||
                                    this.state.validationErrors.hours ||
                                    this.state.validationErrors.minutes
                                }
                                onChange={ this.handleInputChange }
                                onFocus={ this.handleInputFocus }
                                onBlur={ this.handleInputBlur }
                                />
                        </SectionRow>

                        <SectionTitle  isSubtitle={ true }>
                            My settings:
                        </SectionTitle>

                        <SectionRow isLast={ true }>
                            <DropdownInput
                                selectedValue={ this.state.item.altitudeUnit }
                                options={ Altitude.getAltitudeUnitsValueTextList() }
                                labelText='Altitude units:'
                                inputName='altitudeUnit'
                                errorMessage={ this.state.validationErrors.altitudeUnit }
                                onChangeFunc={ this.handleInputChange }
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


PilotEditView.formFields = {
    userName: null,
    initialFlightNum: null,
    initialAirtime: null,
    altitudeUnit: null,
    hours: null,
    minutes: null
};


module.exports = PilotEditView;
