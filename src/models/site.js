'use strict';

var _ = require('lodash');

var Altitude = require('../utils/altitude');
var DataService = require('../services/data-service');
var ErrorTypes = require('../errors/error-types');
var KoiflyError = require('../errors/error');


var SiteModel = {

    formValidationConfig: {
        name: {
            isRequired: true,
            method: 'text',
            rules: {
                defaultVal: '',
                maxLength: 100,
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

    /**
     * Prepare data to show to user
     * @returns {array|null|object} - array of sites
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getSitesArray: function() {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        return _.map(DataService.data.sites, (site, siteId) => {
            return this.getSiteOutput(siteId);
        });
    },

    /**
     * Prepare data to show to user
     * @param {number} siteId
     * @returns {object|null} - site
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getSiteOutput: function(siteId) {
        var loadingError = this.checkForLoadingErrors(siteId);
        if (loadingError !== false) {
            return loadingError;
        }

        if (siteId === undefined) {
            return this.getNewSiteOutput();
        }

        // require FlightModel here so as to avoid circle requirements
        var FlightModel = require('./flight');

        // Get required site from Data Service helper
        var site = DataService.data.sites[siteId];

        var flightNumObj = FlightModel.getNumberOfFlightsAtSite(siteId);
        var flightNum = flightNumObj.total;
        var flightNumThisYear = flightNumObj.thisYear;

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
            flightNum: flightNum,
            flightNumThisYear: flightNumThisYear,
            remarks: site.remarks,
            locationSort: site.location.toUpperCase()
        };
    },

    /**
     * Prepare data to show to user
     * @returns {object|null} - site
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
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

    /**
     * @param {number} siteId
     * @returns {false|null|object}
     * false - if no errors
     * null - if no errors but no data neither
     * error object - if error (either general error or record required by user doesn't exist)
     */
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
            return { error: new KoiflyError(ErrorTypes.RECORD_NOT_FOUND) };
        }
        return false;
    },

    /**
     * @param {object} newSite
     * @returns {Promise} - if saving was successful or not
     */
    saveSite: function(newSite) {
        newSite = this.setSiteInput(newSite);
        return DataService.changeSite(newSite);
    },

    /**
     * Fills empty fields with their defaults
     * takes only fields that should be send to the server
     * modifies some values how they should be stored in DB
     * @param {object} newSite
     * @returns {object} - site ready to send to the server
     */
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

        var currentAltitude = (newSite.id !== undefined) ? DataService.data.sites[newSite.id].launchAltitude : 0;
        var nextAltitude = newSite.launchAltitude;
        var nextAltitudeUnit = newSite.altitudeUnit;
        site.launchAltitude = Altitude.getAltitudeInMeters(nextAltitude, currentAltitude, nextAltitudeUnit);

        return site;
    },

    /**
     * Walks through new site and replace all empty values with default ones
     * @param {object} newSite
     * @returns {object} - with replaced empty fields
     */
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

    /**
     * @param {number} siteId
     * @returns {Promise} - if deleting was successful or not
     */
    deleteSite: function(siteId) {
        return DataService.changeSite({ id: siteId, see: false });
    },

    getLatLngCoordinates: function(siteId) {
        return DataService.data.sites[siteId] ? DataService.data.sites[siteId].coordinates : null;
    },

    /**
     * @param {object} coordinates - object with latitude and longitude ({ lat: ..., lng: ... })
     * @returns {string} - string representation of coordinates
     */
    formCoordinatesOutput: function(coordinates) {
        var outputString = '';
        if (coordinates !== null) {
            outputString = coordinates.lat + ' ' + coordinates.lng;
        }
        return outputString;
    },

    /**
     * @param {string} validString - string representation of coordinates
     * @returns {object} - coordinates object with latitude and longitude ({ lat: ..., lng: ... })
     */
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

    /**
     * @param {number} id
     * @returns {string|null} - site's name or null if no site with given id
     */
    getSiteNameById: function(id) {
        return DataService.data.sites[id] ? DataService.data.sites[id].name : null;
    },

    /**
     * @returns {number|null} - id of last created site or null if no sites yet
     */
    getLastAddedId: function() {
        if (_.isEmpty(DataService.data.sites)) {
            return null;
        }

        var lastAddedSite = _.max(DataService.data.sites, (site) => {
            return Date.parse(site.createdAt);
        });
        return lastAddedSite.id;
    },

    getLaunchAltitudeById: function(id) {
        return DataService.data.sites[id].launchAltitude;
    },

    /**
     * This sites presentation is needed for dropdowns
     * @returns {Array} - array of objects where value is site id, text is site name
     */
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
