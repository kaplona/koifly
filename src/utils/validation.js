'use strict';

var _ = require('lodash');
var Util = require('./util');
var ErrorMessages = require('./error-messages');


var Validation = {

    validateForm: function(validationConfig, formData, isSoft) {
        var errors = {};

        // For each field of given form
        _.each(validationConfig, (config, fieldName) => {
            var validationResult = true;

            // Check if field value is empty
            if (this.isEmpty(formData[fieldName]) && !isSoft && config.isRequired) {
                validationResult = ErrorMessages.NOT_EMPTY.replace('%field', config.rules.field);
            }

            // Otherwise call validation method for this field
            if (!this.isEmpty(formData[fieldName])) {
                var methodName = config.method;
                var rules = config.rules;
                validationResult = this.methods[methodName](formData, fieldName, rules);
            }

            // If validation failed save error message for this field
            if (validationResult != true) {
                errors[fieldName] = validationResult;
            }
        });

        return _.isEmpty(errors) ? true : errors;
    },

    isEmpty: function(value) {
        return (value === null || (value + '').trim() === '');
    },


    // Validation methods return either true or error message
    methods: {

        // Check if value is yyyy-mm-dd date format
        date: function(formData, fieldName) {

            if (!Util.isRightDateFormat(formData[fieldName])) {
                return ErrorMessages.DATE_FORMAT;
            }

            return true;
        },


        // Check if the value is a number
        // additional quality checks:
        // round number, number within min and max
        number: function(formData, fieldName, rules) {

            // If value is not a number
            if (!Util.isNumber(formData[fieldName])) {
                return ErrorMessages.NUMBER.replace('%field', rules.field);
            }

            var errors = [];

            // Check number quality against each given rule
            if (rules.round && !Util.isInteger(formData[fieldName])) {
                errors.push(' round number');
            }

            if (!Util.isNumberWithin(formData[fieldName], rules.min, rules.max)) {
                if (rules.min !== undefined) {
                    errors.push(' greater than ' + rules.min);
                }
                if (rules.max !== undefined) {
                    errors.push(' less than ' + rules.max);
                }
            }

            // If quality control failed
            if (!_.isEmpty(errors)) {
                // Compose an error message
                var errorMessage = rules.field + ' must be';
                for (var i = 0; i < errors.length; i++) {
                    errorMessage += errors[i];
                    if ((i + 1) != errors.length) {
                        errorMessage += ',';
                    }
                }
                // Return the error
                return errorMessage;
            }

            return true;
        },


        // Check text length
        text: function(formData, fieldName, rules) {
            if (formData[fieldName].length > rules.maxLength) {
                var errorMessage = ErrorMessages.MAX_LENGTH;
                return errorMessage.replace('%field', rules.field).replace('%max', rules.maxLength);
            }

            return true;
        },


        // Examples acceptable values:
        // 38.8897°, -77.0089°
        // 45.455678 56.452332
        // -15.0054 , -178.67
        coordinates: function(formData, fieldName, rules) {

            // Repplace all degree characters by space
            var coord = formData[fieldName].replace(/°/g, ' ').trim();

            // Split user input by reg:
            // any number of space | any number of ',' | space or ',' | any number of ',' | any number of space
            var coordArray = coord.split(/\s*,*[,\s],*\s*/);

            // If user input is two char sets (presumably latitude and longitude)
            if (coordArray.length === 2) {
                // If latitude and longitude value is a number
                if (Util.isNumber(coordArray[0]) && Util.isNumber(coordArray[1])) {
                    // If latitude and longitude are within given limits
                    if (Util.isNumberWithin(coordArray[0], rules.minLatitude, rules.maxLatitude) &&
                        Util.isNumberWithin(coordArray[1], rules.minLongitude, rules.maxLongitude)) {
                            return true;
                    }
                }
            }

            // If validation failed
            return ErrorMessages.COORDINATES;
        }
    }
};

module.exports = Validation;
