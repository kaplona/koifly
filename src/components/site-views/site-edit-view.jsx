'use strict';

var React = require('react');
var _ = require('lodash');

const ZOOM_LEVEL = require('../../constants/map-constants').ZOOM_LEVEL;

var DomUtil = require('../../utils/dom-util');
var editViewMixin = require('../mixins/edit-view-mixin');
var SiteModel = require('../../models/site');
var Util = require('../../utils/util');

var AltitudeInput = require('../common/inputs/altitude-input');
var CoordinatesInput = require('../common/inputs/coordinates-input');
var InteractiveMap = require('../common/maps/interactive-map');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var RemarksInput = require('../common/inputs/remarks-input');
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var SectionTitle = require('../common/section/section-title');
var TextInput = require('../common/inputs/text-input');
var View = require('../common/view');



var { shape, string } = React.PropTypes;

var SiteEditView = React.createClass({

    propTypes: {
        params: shape({ // url args
            id: string
        })
    },

    mixins: [ editViewMixin(SiteModel.getModelKey()) ],

    getInitialState: function() {
        return {
            validationErrors: _.clone(SiteEditView.formFields)
        };
    },

    handleMapShow: function() {
        this.setState({ isMapShown: true });
    },

    handleMapHide: function() {
        this.setState({ isMapShown: false });
    },

    getMarkerPosition: function() {
        if (!Util.isEmptyString(this.state.item.coordinates)) {
            // Hard validation in order to check coordinates format
            var validationErrors = this.getValidationErrors();
            if (!validationErrors || !validationErrors.coordinates) {
                // Change user input in { lat: 56.56734543, lng: 123.4567543 } format
                return Util.stringToCoordinates(this.state.item.coordinates);
            }
        }
        return null;
    },
    
    renderMobileTopMenu: function() {
        return (
            <MobileTopMenu
                leftButtonCaption={ this.state.isMapShown ? 'Back' : 'Cancel' }
                rightButtonCaption={ this.state.isMapShown ? null : 'Save' }
                onLeftClick={ this.state.isMapShown ? this.handleMapHide : this.handleCancelEdit }
                onRightClick={ this.state.isMapShown ? null : this.handleSubmit }
                isPositionFixed={ !this.state.isInputInFocus }
                />
        );
    },

    renderMap: function() {
        if (!this.state.isMapShown) {
            return null;
        }

        DomUtil.scrollToTheTop();

        var markerPosition = this.getMarkerPosition();

        return InteractiveMap.create({
            markerId: this.state.item.id,
            center: markerPosition || undefined,
            zoomLevel: markerPosition ? ZOOM_LEVEL.site : ZOOM_LEVEL.region,
            markerPosition: markerPosition || undefined,
            location: this.state.item.location,
            launchAltitude: this.state.item.launchAltitude,
            altitudeUnit: this.state.item.altitudeUnit,
            onDataApply: this.handleInputChange,
            onMapClose: this.handleMapHide
        });
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
                            Edit Site
                        </SectionTitle>
                        
                        <SectionRow>
                            <TextInput
                                inputValue={ this.state.item.name }
                                labelText={ <span>Name<sup>*</sup>:</span> }
                                inputName='name'
                                errorMessage={ this.state.validationErrors.name }
                                onChange={ this.handleInputChange }
                                onFocus={ this.handleInputFocus }
                                onBlur={ this.handleInputBlur }
                                />
                        </SectionRow>

                        <SectionRow>
                            <CoordinatesInput
                                inputValue={ this.state.item.coordinates }
                                labelText='Coordinates:'
                                errorMessage={ this.state.validationErrors.coordinates }
                                onChange={ this.handleInputChange }
                                onMapShow={ this.handleMapShow }
                                onFocus={ this.handleInputFocus }
                                onBlur={ this.handleInputBlur }
                                />
                        </SectionRow>

                        <SectionRow>
                            <TextInput
                                inputValue={ this.state.item.location }
                                labelText='Location:'
                                inputName='location'
                                errorMessage={ this.state.validationErrors.location }
                                onChange={ this.handleInputChange }
                                onFocus={ this.handleInputFocus }
                                onBlur={ this.handleInputBlur }
                                />
                        </SectionRow>

                        <SectionRow>
                            <AltitudeInput
                                inputValue={ this.state.item.launchAltitude }
                                selectedAltitudeUnit={ this.state.item.altitudeUnit }
                                labelText='Launch altitude:'
                                inputName='launchAltitude'
                                errorMessage={ this.state.validationErrors.launchAltitude }
                                onChange={ this.handleInputChange }
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

                        { this.renderMap() }

                    </Section>

                    { this.renderMobileButtons() }
                </form>

                { this.renderNavigationMenu() }
            </View>
        );
    }
});


SiteEditView.formFields = {
    name: null,
    launchAltitude: null,
    location: null,
    coordinates: null,
    remarks: null
};


module.exports = SiteEditView;
