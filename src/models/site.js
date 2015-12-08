'use strict';

var _ = require('lodash');
var DataService = require('../services/data-service');
var Altitude = require('../utils/altitude');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');


var SiteModel = {

    formValidationConfig: {
        name: {
            isRequired: true,
            method: 'text',
            rules: {
                defaultVal: '',
                maxLength: 10,
                field: 'Site name'
            }
        },
        location: {
            method: 'text',
            rules: {
                defaultVal: '',
                maxLength: 1000,
                field: 'Location'
            }
        },
        coordinates: {
            method: 'coordinates',
            rules: {
                minLatitude: -90,
                maxLatitude: 90,
                minLongitude: -180,
                maxLongitude: 180,
                defaultVal: null,
                field: 'Coordinates'
            }
        },
        launchAltitude: {
            method: 'number',
            rules: {
                min: 0,
                defaultVal: 0,
                field: 'Launch Altitude'
            }
        },
        remarks: {
            method: 'text',
            rules: {
                defaultVal: '',
                maxLength: 10000,
                field: 'Remarks'
            }
        }
    },

    getSitesArray: function() {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        return _.map(DataService.data.sites, (site, siteId) => {
            return this.getSiteOutput(siteId);
        });
    },

    getSiteOutput: function(siteId) {
        var loadingError = this.checkForLoadingErrors(siteId);
        if (loadingError !== false) {
            return loadingError;
        }

        if (siteId === undefined) {
            return this.getNewSiteOutput();
        }

        // Get required site from Data Service helper
        var site = DataService.data.sites[siteId];

        var coordinates = this.formCoordinatesOutput(site.coordinates);
        var altitude = Altitude.getAltitudeInPilotUnits(site.launchAltitude);
        var altitudeUnit = Altitude.getUserAltitudeUnit();

        return {
            id: siteId,
            name: site.name,
            location: site.location,
            coordinates: coordinates,
            launchAltitude: altitude,
            altitudeUnit: altitudeUnit,
            remarks: site.remarks,
            locationSort: site.location.toUpperCase()
        };
    },

    getNewSiteOutput: function() {
        return {
            name: '',
            location: '',
            coordinates: '', // TODO default local coordinates
            launchAltitude: 0,
            altitudeUnit: Altitude.getUserAltitudeUnit(),
            remarks: ''
        };
    },

    checkForLoadingErrors: function(siteId) {
        // Check for loading errors
        if (DataService.data.loadingError !== null) {
            DataService.loadData();
            return { error: DataService.data.loadingError };
        // Check if data was loaded
        } else if (DataService.data.sites === null) {
            DataService.loadData();
            return null;
        // Check if required id exists
        } else if (siteId && DataService.data.sites[siteId] === undefined) {
            return { error: new KoiflyError(ErrorTypes.NO_EXISTENT_RECORD) };
        }
        return false;
    },

    saveSite: function(newSite) {
        newSite = this.setSiteInput(newSite);
        return DataService.changeSite(newSite);
    },

    setSiteInput: function(newSite) {
        // Set default values to empty fields
        newSite = this.setDefaultValues(newSite);

        // Create a site only with fields which will be send to the server
        var site = {};
        site.id = newSite.id;
        site.name = newSite.name;
        site.location = newSite.location;
        site.coordinates = this.formCoordinatesInput(newSite.coordinates);
        site.remarks = newSite.remarks;

        var oldAltitude = (newSite.id !== undefined) ? DataService.data.sites[newSite.id].launchAltitude : 0;
        var newAltitude = newSite.launchAltitude;
        var newAltitudeUnit = newSite.altitudeUnit;
        site.launchAltitude = Altitude.getAltitudeInMeters(newAltitude, oldAltitude, newAltitudeUnit);

        return site;
    },

    setDefaultValues: function(newSite) {
        var fieldsToReplace = {};
        _.each(this.formValidationConfig, (config, fieldName) => {
            // If there is default value for the field which val is null or undefined or ''
            if ((newSite[fieldName] === null ||
                 newSite[fieldName] === undefined ||
                (newSite[fieldName] + '').trim() === '') &&
                 config.rules.defaultVal !== undefined
            ) {
                // Set it to its default value
                fieldsToReplace[fieldName] = config.rules.defaultVal;
            }
        });
        return _.extend({}, newSite, fieldsToReplace);
    },

    deleteSite: function(siteId) {
        return DataService.changeSite({ id: siteId, see: 0 });
    },

    getLatLngCoordinates: function(siteId) {
        return DataService.data.sites[siteId] ? DataService.data.sites[siteId].coordinates : null;
    },

    formCoordinatesOutput: function(coordinates) {
        var outputString = '';
        if (coordinates !== null) {
            outputString = coordinates.lat + ' ' + coordinates.lng;
        }
        return outputString;
    },

    formCoordinatesInput: function(validString) {
        if (validString === null) {
            return null;
        }
        validString = validString.replace(/°/g, ' ').trim();
        var latLng = validString.split(/\s*,*[,\s],*\s*/);
        return { lat: parseFloat(latLng[0]), lng: parseFloat(latLng[1]) };
    },

    getNumberOfSites: function() {
        return Object.keys(DataService.data.sites).length;
    },

    getSiteNameById: function(id) {
        return DataService.data.sites[id] ? DataService.data.sites[id].name : null;
    },

    // Return last added site id or null if no data has been added yet
    getLastAddedId: function() {
        if (_.isEmpty(DataService.data.sites)) {
            return null;
        }

        return _.min(DataService.data.sites, (site) => {
            return site.createdAt;
        });
    },

    getLaunchAltitudeById: function(id) {
        return DataService.data.sites[id].launchAltitude;
    },

    getSiteValueTextList: function() {
        return _.map(DataService.data.sites, (site, siteId) => {
            return { value: siteId, text: site.name };
        });
    },

    getSiteIdsList: function() {
        return Object.keys(DataService.data.sites);
    },

    getValidationConfig: function() {
        return this.formValidationConfig;
    }
};


module.exports = SiteModel;
