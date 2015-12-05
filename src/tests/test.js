'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Util = require('../utils/util');


//var miniFlight = {
//    date: '2015-09-01',
//    remarks: ''
//};
//
//var flight = {
//    id: 1, // test id
//    date: '2015-09-01',
//    altitude: 1000,
//    airtime: 100,
//    siteId: null,
//    gliderId: null,
//    remarks: 'TEST'
//};

var emptyFlight = {
    date: '2015-11-01',
    altitude: '',
    airtime: '',
    siteId: '',
    gliderId: '',
    remarks: ''
};

//var miniSite = {
//    name: 'newName',
//    remarks: ''
//};
//
//var site = {
//    id: 1, // test id
//    name: 'someName',
//    location: 'somewhere',
//    launchAltitude: 1000,
//    coordinates: { lat: 48.693829, lng: -98.893716 }, // middle USA
//    remarks: 'TEST'
//};
//
//var miniGlider = {
//    name: 'newName',
//    remarks: ''
//};
//
//var glider = {
//    id: 1, // test id
//    name: 'someName',
//    initialFlightNum: 10,
//    initialAirtime: 100,
//    remarks: ''
//};
//
//function modifyData(data, field, value) {
//    data = _.clone(data);
//    data[field] = value;
//    return data;
//}


var Test = {

    tests: {
        NEGATIVE_FLIGHT_AIRTIME: { data: { id: 4, airtime: -10 }, dataType: 'flight' },
        NO_EXISTENT_SITE_ID: { data: { id: 4, siteId: 10 }, dataType: 'flight' },
        DELETED_SITE_ID: { data: { id: 4, siteId: 3 }, dataType: 'flight' },
        NO_EXISTENT_GLIDE_ID: { data: { id: 4, gliderId: 10 }, dataType: 'flight' },
        DELETED_GLIDER_ID: { data: { id: 4, gliderId: 3 }, dataType: 'flight' },
        DOUBLE_SITE_NAME: { data: { id: 4, name: 'US spot' }, dataType: 'site' },
        DOUBLE_GLIDER_NAME: { data: { id: 4, name: 'Sport 2' }, dataType: 'glider' },
        SEE_NOT_BOOL: { data: { id: 4, see: 10 }, dataType: 'flight' },
        NOT_VALID_ALTITUDE_UNITS: { data: { altitudeUnit: 'otherUnit' }, dataType: 'pilot' },
        NOT_ROUND_AIRTIME: { data: { id: 4, airtime: 10.34 }, dataType: 'flight' },
        NOT_ROUND_INITIAL_FLIGHT_NUM: { data: { id: 4, initialFlightNum: 10.34 }, dataType: 'glider' },
        EMPTY_STRING_VALUES: { data: emptyFlight, dataType: 'flight' },
        NO_EXISTENT_RECORD: { data: { id: 'id', remarks: 'no existent record' }, dataType: 'flight' },
        OTHER_PILOT_RECORD: { data: { id: 5, remarks: 'changing other pilot record' }, dataType: 'flight' }
        //DEFAULT_FLIGHT_VALUES: { data: modifyData(miniFlight, 'siteId', 1), dataType: 'flight' },
        //DEFAULT_SITE_VALUES: { data: miniSite, dataType: 'site' },
        //DEFAULT_GLIDER_VALUES: { data: miniGlider, dataType: 'glider' }
    },

    runTests: function() {
        _.each(this.tests, (test, testName) => {
            this.sendData(test.data, test.dataType, testName);
        }, this);
    },

    sendData: function(data, dataType, testName) {
        data = {
            lastModified: Util.timeNow(),
            data: JSON.stringify(data),
            dataType: dataType
        };

        $.ajax({
                method: 'POST',
                url: '/api/data',
                context: this,
                dataType: 'json',
                data: data
            })
            .done((msg) => {
                console.log(testName + ' =>', msg);
                //testHandler(msg, testName);
            });
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
