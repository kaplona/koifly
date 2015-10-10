'use strict';

var $ = require('jquery');
var PubSub = require('./../utils/pubsub');
var DataService = require('../services/data-service');
var PilotModel = require('./pilot');


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
        altitudeUnits: {
            method: 'selectOption',
            rules: {
                getArrayOfOptions: function() {
                    return PilotModel.getAltitudeUnitsList();
                },
                field: 'Altitude Units'
            }
        }
    },

    getSitesArray: function() {
        if (DataService.data.sites === null) {
            return null;
        }
        var siteOutputs = [];
        $.each(DataService.data.sites, (siteId) => siteOutputs.push(this.getSiteOutput(siteId)));
        return siteOutputs;
    },

    getSiteOutput: function(id) {
        if (DataService.data.sites === null) {
            return null;
        }
        if (DataService.data.sites[id] === undefined) {
            return null;
        }
        var coordinates = this.formCoordinatesOutput(DataService.data.sites[id].coordinates);
        var altitude = PilotModel.getAltitudeInPilotUnits(DataService.data.sites[id].launchAltitude);
        var altitudeUnits = PilotModel.getAltitudeUnits();

        return {
            id: id,
            name: DataService.data.sites[id].name,
            location: DataService.data.sites[id].location,
            coordinates: coordinates,
            launchAltitude: altitude,
            altitudeUnits: altitudeUnits,
            locationSort: DataService.data.sites[id].location.toUpperCase()
        };
    },

    getNewSiteOutput: function() {
        if (DataService.data.sites === null) {
            return null;
        }
        return {
            name: '',
            location: '',
            coordinates: '', // !!! default local coordinates
            launchAltitude: 0,
            altitudeUnits: PilotModel.getAltitudeUnits()
        };
    },

    saveSite: function(newSite) {
        newSite = this.setSiteInput(newSite);
        DataService.changeSites([ newSite ]);
    },

    setSiteInput: function(newSite) {
        // Set default values to empty fields
        newSite = this.setDefaultValues(newSite);

        var oldAltitude = (newSite.id !== undefined) ? DataService.data.sites[newSite.id].launchAltitude : 0;
        var newAltitude = newSite.launchAltitude;
        var units = newSite.altitudeUnits;
        newSite.launchAltitude = PilotModel.getAltitudeInMeters(newAltitude, oldAltitude, units);
        newSite.coordinates = this.formCoordinatesInput(newSite.coordinates);
        return newSite;
    },

    setDefaultValues: function(newSite) {
        $.each(this.formValidationConfig, (fieldName, config) => {
            // If there is default value for the field which val is null or undefined or ''
            if ((newSite[fieldName] === null || (newSite[fieldName] + '').trim() === '') &&
                 config.rules.defaultVal !== undefined
            ) {
                // Set it to its default value
                newSite[fieldName] = config.rules.defaultVal;
            }
        });
        return newSite;
    },

    deleteSite: function(siteId) {
        PubSub.emit('siteDeleted', { siteId: siteId });
        DataService.changeSites([ { id: siteId, see: 0 } ]);
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
        return simpleList;
    },

    getSiteIdsList: function() {
        return Object.keys(DataService.data.sites);
    },

    getValidationConfig: function() {
        return this.formValidationConfig;
    }
};


module.exports = SiteModel;
