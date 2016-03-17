'use strict';

var _ = require('lodash');

var Altitude = require('../utils/altitude');
var BaseModel = require('./base-model');
var dataService = require('../services/data-service');
var ErrorTypes = require('../errors/error-types');
var KoiflyError = require('../errors/error');


var SiteModel = {

    keys: {
        single: 'site',
        plural: 'sites'
    },

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
    getListOutput: function() {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        return _.map(dataService.store.sites, (site, siteId) => {
            return this.getItemOutput(siteId);
        });
    },
    

    /**
     * Prepare data to show to user
     * @param {string} siteId
     * @returns {object|null} - site
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getItemOutput: function(siteId) {
        var loadingError = this.checkForLoadingErrors(siteId);
        if (loadingError !== false) {
            return loadingError;
        }

        // require FlightModel here so as to avoid circle requirements
        var FlightModel = require('./flight');

        // Get required site from Data Service helper
        var site = dataService.store.sites[siteId];

        // var { total, thisYear } = FlightModel.getNumberOfFlightsAtSite(siteId);
        var flightNumObj = FlightModel.getNumberOfFlightsAtSite(siteId);
        var flightNum = flightNumObj.total;
        var flightNumThisYear = flightNumObj.thisYear;

        return {
            id: site.id,
            name: site.name,
            location: site.location,
            coordinates: this.formCoordinatesOutput(site.coordinates),
            latLng: site.coordinates,
            launchAltitude: Altitude.getAltitudeInPilotUnits(site.launchAltitude),
            altitudeUnit: Altitude.getUserAltitudeUnit(),
            flightNum: flightNum,
            flightNumThisYear: flightNumThisYear,
            remarks: site.remarks
        };
    },
    

    /**
     * Prepare data to show to user
     * @param {string} siteId
     * @returns {object|null} - site
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getEditOutput: function(siteId) {
        var loadingError = this.checkForLoadingErrors(siteId);
        if (loadingError !== false) {
            return loadingError;
        }

        if (siteId === undefined) {
            return this.getNewItemOutput();
        }
        
        // Get required site from Data Service helper
        var site = dataService.store.sites[siteId];
        
        return {
            id: site.id,
            name: site.name,
            location: site.location,
            coordinates: this.formCoordinatesOutput(site.coordinates),
            launchAltitude: Altitude.getAltitudeInPilotUnits(site.launchAltitude).toString(),
            altitudeUnit: Altitude.getUserAltitudeUnit(),
            remarks: site.remarks
        };
    },

    
    /**
     * Prepare data to show to user
     * @returns {object|null} - site
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getNewItemOutput: function() {
        return {
            name: '',
            location: '',
            coordinates: '', // TODO default local coordinates
            launchAltitude: '0',
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
        if (dataService.loadingError !== null) {
            dataService.initiateStore();
            return { error: dataService.loadingError };
        // Check if data was loaded
        } else if (dataService.store.sites === null) {
            dataService.initiateStore();
            return null;
        // Check if required id exists
        } else if (siteId && dataService.store.sites[siteId] === undefined) {
            return { error: new KoiflyError(ErrorTypes.RECORD_NOT_FOUND) };
        }
        return false;
    },


    /**
     * Fills empty fields with their defaults
     * takes only fields that should be send to the server
     * modifies some values how they should be stored in DB
     * @param {object} newSite
     * @returns {object} - site ready to send to the server
     */
    getDataForServer: function(newSite) {
        // Set default values to empty fields
        newSite = this.setDefaultValues(newSite);

        // Create a site only with fields which will be send to the server
        var site = {
            id: newSite.id,
            name: newSite.name,
            location: newSite.location,
            coordinates: this.formCoordinatesInput(newSite.coordinates),
            remarks: newSite.remarks
        };

        var currentAltitude = (newSite.id !== undefined) ? dataService.store.sites[newSite.id].launchAltitude : 0;
        var nextAltitude = parseInt(newSite.launchAltitude);
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
    

    getLatLngCoordinates: function(siteId) {
        return dataService.store.sites[siteId] ? dataService.store.sites[siteId].coordinates : null;
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
        return Object.keys(dataService.store.sites).length;
    },

    
    /**
     * @param {number} id
     * @returns {string|null} - site's name or null if no site with given id
     */
    getSiteNameById: function(id) {
        return dataService.store.sites[id] ? dataService.store.sites[id].name : null;
    },

    
    /**
     * @returns {number|null} - id of last created site or null if no sites yet
     */
    getLastAddedId: function() {
        if (_.isEmpty(dataService.store.sites)) {
            return null;
        }

        var lastAddedSite = _.max(dataService.store.sites, (site) => {
            return Date.parse(site.createdAt);
        });
        return lastAddedSite.id;
    },
    

    getLaunchAltitudeById: function(id) {
        return dataService.store.sites[id].launchAltitude;
    },

    
    /**
     * This sites presentation is needed for dropdowns
     * @returns {Array} - array of objects where value is site id, text is site name
     */
    getSiteValueTextList: function() {
        return _.map(dataService.store.sites, (site, siteId) => {
            return { value: siteId, text: site.name };
        });
    }
};


SiteModel = _.extend({}, BaseModel, SiteModel);


module.exports = SiteModel;
