'use strict';

var _ = require('lodash');
var sequelize = require('../orm/sequelize');
var NormalizeError = require('../utils/error-normalize');
var Pilot = require('../orm/pilots');


sequelize.sync();


var SignInHandler = function(request, reply) {
    var newPilot = JSON.parse(request.payload);

    Pilot.create(newPilot).then((pilot) => {
        reply();
    }).catch((err) => {
        //DEV
        console.log('error => ', err);

        reply(JSON.stringify({ error: NormalizeError(err) }));
    });
};


module.exports = SignInHandler;
