'use strict';

var _ = require('lodash');


var Test = {

    lastModified: '2016-01-01T00:00:00.000Z',

    flight: {
        date: '2016-01-01',
        siteId: null,
        gliderId: null,
        altitude: 0,
        airtime: 0,
        remarks: ''
    },

    site: {
        name: 'someSite',
        location: 'someLocation',
        launchAltitude: 0,
        coordinates: null,
        remarks: ''
    },

    glider: {
        name: 'someGlider',
        initialFlightNum: 0,
        initialAirtime: 0,
        remarks: ''
    },

    pilot: {
        userName: '',
        initialFlightNum: 0,
        initialAirtime: 0,
        altitudeUnit: 'meter'
    },

    ids: {
        flight: 11,
        site: 6,
        glider: 7,
        pilot: 13
    },

    testData: {
        flight: {
            EMPTY_DATE: { date: null },
            WRONG_DATE_FORMAT: { date: '31.12.15' },
            NEGATIVE_ALTITUDE: { altitude: -10 },
            NOT_NUMERIC_ALTITUDE: { altitude: 'abc' },
            NEGATIVE_AIRTIME: { airtime: -10 },
            NOT_NUMERIC_AIRTIME: { airtime: 'abc' },
            NOT_ROUND_AIRTIME: { airtime: 10.34 },
            NO_EXISTENT_SITE_ID: { siteId: 100 },
            DELETED_SITE_ID: { siteId: 3 },
            NO_EXISTENT_GLIDE_ID: { gliderId: 100 },
            DELETED_GLIDER_ID: { gliderId: 3 }

            //NO_EXISTENT_RECORD: { id: 'id', remarks: 'no existent record' },
            //OTHER_PILOT_RECORD: { id: 5, remarks: 'changing other pilot record' },
        },

        site: {
            EMPTY_SITE_NAME: { name: null },
            DOUBLE_SITE_NAME: { name: 'Grouse' },
            NEGATIVE_LAUNCH_ALTITUDE: { launchAltitude: -10 },
            NOT_NUMERIC_LAUNCH_ALTITUDE: { launchAltitude: 'abc' },
            EMPTY_LAT: { coordinates: { lat: null, lng: 0 } },
            NOT_NUMERIC_LAT: { coordinates: { lat: 'abc', lng: 0 } },
            NOT_PROPER_LAT: { coordinates: { lat: 1200, lng: 0 } }
        },

        glider: {
            EMPTY_GLIDER_NAME: { name: null },
            DOUBLE_GLIDER_NAME: { name: 'glider 2' },
            NEGATIVE_GLIDER_FLIGHT_NUM: { initialFlightNum: -10 },
            NOT_NUMERIC_GLIDER_FLIGHT_NUM: { initialFlightNum: 'abc' },
            NOT_ROUND_GLIDER_FLIGHT_NUM: { initialFlightNum: 10.34 },
            NEGATIVE_GLIDER_AIRTIME: { initialAirtime: -10 },
            NOT_NUMERIC_GLIDER_AIRTIME: { initialAirtime: 'abc' },
            NOT_ROUND_GLIDER_AIRTIME: { initialAirtime: 10.34 }
        },

        pilot: {
            NOT_VALID_ALTITUDE_UNITS: { altitudeUnit: 'otherUnit' },
            NEGATIVE_PILOT_FLIGHT_NUM: { initialFlightNum: -10 },
            NOT_NUMERIC_PILOT_FLIGHT_NUM: { initialFlightNum: 'abc' },
            NOT_ROUND_PILOT_FLIGHT_NUM: { initialFlightNum: 10.34 },
            NEGATIVE_PILOT_AIRTIME: { initialAirtime: -10 },
            NOT_NUMERIC_PILOT_AIRTIME: { initialAirtime: 'abc' },
            NOT_ROUND_PILOT_AIRTIME: { initialAirtime: 10.34 }
        }
    },

    runTests: function() {
        _.each(this.testData, (tests, dataType) => {
            _.each(tests, (data, testName) => {
                data = _.extend({}, Test[dataType], data, { id: Test.ids[dataType] });
                this.sendData(data, dataType, testName);
            });
        });
    },

    sendData: function(data, dataType, testName) {
        data = {
            lastModified: this.lastModified,
            data: data,
            dataType: dataType
        };

        var ajaxRequest = new XMLHttpRequest();
        ajaxRequest.responseType = 'json'; // EI 10
        ajaxRequest.addEventListener('load', () => this.printResponse(testName, ajaxRequest.response)); // EI 10
        ajaxRequest.addEventListener('error', () => this.printResponse(testName, ajaxRequest.response));
        ajaxRequest.addEventListener('timeout', () => this.printResponse(testName, ajaxRequest.response));
        ajaxRequest.open('post', '/api/data');
        ajaxRequest.send(JSON.stringify(data));
    },

    printResponse: function(testName, serverResponse) {
        //console.log('test response: ', JSON.parse(this.responseText));
        if (serverResponse.error && serverResponse.error.errors) {
            serverResponse = serverResponse.error.errors;
        }
        console.log(testName, ' => ', serverResponse);
        //testHandler(testName, serverResponse);
    },


    minValueFailed: function(msg, testName) {
        if (msg.name === 'SequelizeValidationError' &&
            msg.message === 'Validation error: Validation min failed'
        ) {
            console.log(testName + ' => CAUGHT');
        }
        console.warn(testName + 'failed');
    }
};


module.exports = Test;
