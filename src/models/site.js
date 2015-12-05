'use strict';

var $ = require('jquery');
var _ = require('underscore');
var DataService = require('../services/data-service');
var Altitude = require('../utils/altitude');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');


var SiteModel = {

    formValidationConfig: {
        name: {
            method: 'unique',
            rules: {
                getDataArray: function() {
                    return SiteModel.getSitesArray();
                },
                field: 'Name'
            }
        },
        location: {
            method: 'text',
            rules: {
                defaultVal: '',
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
        altitudeUnit: {
            method: 'selectOption',
            rules: {
                getArrayOfOptions: function() {
                    return Altitude.getAltitudeUnitsList();
                },
                field: 'Altitude Units'
            }
        },
        remarks: {
            method: 'text',
            rules: {
                defaultVal: '',
                field: 'Remarks'
            }
        }
    },

    getSitesArray: function() {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        var siteOutputs = [];
        $.each(DataService.data.sites, (siteId) => siteOutputs.push(this.getSiteOutput(siteId)));
        return siteOutputs;
    },

    getSiteOutput: function(id) {
        var loadingError = this.checkForLoadingErrors(id);
        if (loadingError !== false) {
            return loadingError;
        }

        var coordinates = this.formCoordinatesOutput(DataService.data.sites[id].coordinates);
        var altitude = Altitude.getAltitudeInPilotUnits(DataService.data.sites[id].launchAltitude);
        var altitudeUnit = Altitude.getUserAltitudeUnit();

        return {
            id: id,
            name: DataService.data.sites[id].name,
            location: DataService.data.sites[id].location,
            coordinates: coordinates,
            launchAltitude: altitude,
            altitudeUnit: altitudeUnit,
            remarks: DataService.data.sites[id].remarks,
            locationSort: DataService.data.sites[id].location.toUpperCase()
        };
    },

    getNewSiteOutput: function() {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        return {
            name: '',
            location: '',
            coordinates: '', // !!! default local coordinates
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
        $.each(this.formValidationConfig, (fieldName, config) => {
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
        return DataService.data.sites[id].name;
    },

    // Return last added site id or null if no data has been added yet
    getLastAddedId: function() {
        var lastSite = {
            id: null,
            creationDateTime: '1900-01-01 00:00:00'
        };
        $.each(DataService.data.sites, (siteId, site) => {
            if (lastSite.creationDateTime < site.creationDateTime) {
                lastSite = site;
            }
        });
        return lastSite.id;
    },

    getLaunchAltitudeById: function(id) {
        return DataService.data.sites[id].launchAltitude;
    },

    getSiteSimpleList: function() {
        var simpleList = {};
        $.each(DataService.data.sites, (siteId, site) => {
            simpleList[siteId] = site.name;
        });

        //TODO use _.mapValues in lodash https://lodash.com/docs#mapValues
        return simpleList;
    },

    getSiteValueTextList: function() {
        var valueTextList = [];
        $.each(DataService.data.sites, (siteId, site) => {
            valueTextList.push({ value: siteId, text: site.name });
        });
        return valueTextList;
    },

    getSiteIdsList: function() {
        return Object.keys(DataService.data.sites);
    },

    getValidationConfig: function() {
        return this.formValidationConfig;
    }
};


module.exports = SiteModel;
