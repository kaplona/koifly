'use strict';

var _ = require('lodash');
var objectValues = require('object.values');

var Altitude = require('../utils/altitude');
var BaseModel = require('./base-model');
var Util = require('../utils/util');


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
                round: true,
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
     * Returns raw site list.
     * @return {Array}
     */
    getList() {
        const storeContent = this.getStoreContent();
        if (!storeContent || storeContent.error) {
            return [];
        }
        return objectValues(storeContent).map(site => site);
    },
    

    /**
     * Prepare data to show to user
     * @returns {array|null|object} - array of sites
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getListOutput: function() {
        var storeContent = this.getStoreContent();
        if (!storeContent || storeContent.error) {
            return storeContent;
        }

        return objectValues(storeContent).map(site => {
            return {
                id: site.id,
                name: site.name,
                location: site.location,
                launchAltitude: Altitude.getAltitudeInPilotUnits(site.launchAltitude),
                coordinates: Util.coordinatesToString(site.coordinates),
                latLng: site.coordinates
            };
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
        var site = this.getStoreContent(siteId);
        if (!site || site.error) {
            return site;
        }

        // require FlightModel here so as to avoid circle requirements
        var FlightModel = require('./flight');
        var flightStats = FlightModel.getNumberOfFlightsAtSite(site.id);

        return {
            id: site.id,
            name: site.name,
            location: site.location,
            coordinates: Util.coordinatesToString(site.coordinates),
            latLng: site.coordinates,
            launchAltitude: Altitude.getAltitudeInPilotUnits(site.launchAltitude),
            flightNum: flightStats.total,
            flightNumThisYear: flightStats.thisYear,
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
        if (siteId === undefined) {
            return this.getNewItemOutput();
        }

        var site = this.getStoreContent(siteId);
        if (!site || site.error) {
            return site;
        }

        // If launchAltitude is 0 show empty string to user
        // So user won't need to erase 0 before entering altitude
        var launchAltitude = site.launchAltitude ? Altitude.getAltitudeInPilotUnits(site.launchAltitude) : '';

        return {
            id: site.id,
            name: site.name,
            location: site.location,
            coordinates: Util.coordinatesToString(site.coordinates),
            launchAltitude: launchAltitude.toString(),
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
        var storeContent = this.getStoreContent();
        if (!storeContent || storeContent.error) {
            return storeContent;
        }

        return {
            name: '',
            location: '',
            coordinates: '', // @TODO default local coordinates
            launchAltitude: '',
            altitudeUnit: Altitude.getUserAltitudeUnit(),
            remarks: ''
        };
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
            coordinates: newSite.coordinates ? Util.stringToCoordinates(newSite.coordinates) : newSite.coordinates,
            remarks: newSite.remarks
        };

        var currentAltitude = (newSite.id !== undefined) ? this.getStoreContent(newSite.id).launchAltitude : 0;
        var nextAltitude = parseInt(newSite.launchAltitude);
        var nextAltitudeUnit = newSite.altitudeUnit;
        site.launchAltitude = Altitude.getAltitudeInMeters(nextAltitude, currentAltitude, nextAltitudeUnit);

        return site;
    },


    /**
     * @param {number} siteId - assumption: site id exists
     * @returns {string|null} - site's name or null if no site with given id
     */
    getSiteName: function(siteId) {
        var getStoreContent = this.getStoreContent(siteId);
        return !getStoreContent.error ? getStoreContent.name : null;
    },


    /**
     * @param {number|null} siteId - assumption: site id exists
     * @returns {{lat: number, lng: number}|null} - coordinates object or null if siteId or coordinates are not specified
     */
    getLatLng: function(siteId) {
        return siteId ? this.getStoreContent(siteId).coordinates : null;
    },


    /**
     * @param {number} siteId - assumption: site id exists
     * @returns {number} - site launch altitude in pilot units
     */
    getLaunchAltitude: function(siteId) {
        return Altitude.getAltitudeInPilotUnits(this.getStoreContent(siteId).launchAltitude);
    },

    
    /**
     * @returns {number|null} - id of last created site or null if no sites yet
     */
    getLastAddedId: function() {
        var storeContent = this.getStoreContent();
        if (_.isEmpty(storeContent)) {
            return null;
        }

        return _.max(storeContent, site => Date.parse(site.createdAt)).id;
    },
    
    
    /**
     * This presentation is required for dropdown options
     * @returns {Array} - array of objects where value is site id, text is site name
     */
    getSiteValueTextList: function() {
        return objectValues(this.getStoreContent()).map(Util.valueTextPairs('id', 'name'));
    }
};


SiteModel = _.extend({}, BaseModel, SiteModel);


module.exports = SiteModel;
