'use strict';

var $ = require('jquery');
var Util = require('./util');


var Validation = {

    validateForm: function(validationConfig, formData, isSoft) {
        var errors = {};
        var noErrors = true;

        // For each field of given form
        $.each(validationConfig, (fieldName, config) => {
            // Call validation method for this field
            var methodName = config.method;
            var rules = config.rules;
            var validationResult = this.methods[methodName](formData, fieldName, rules, isSoft);

            // If validation failed
            if (validationResult != true) {
                // Write error message for this field
                errors[fieldName] = validationResult;
                noErrors = false;
            }
        });

        return noErrors ? true : errors;
    },


    // Validate one field value
    // Returns true or error message
    // Params:
    //         validationConfig: { rules: ... , method: ... }
    //         formValues: { fieldName: fieldValue, ...other needed info }
    validateField: function(validationConfig, formValues, fieldName) {
        // Call validation method for the given field
        var methodName = validationConfig[fieldName].method;
        var rules = validationConfig[fieldName].rules;
        return this.methods[methodName](formValues, fieldName, rules, true);
    },


    // Vallidation methods return an object with next fields:
    // status (true or false) depends on either validation check succeded or failed
    // value - the modified value if validation succeded
    // errorMessage - message to show to user in case of failure
    methods: {

        isEmpty: function(value, rules) {
            // If value is empty
            if (value === null || (value + '').trim() === '') {
                // And no default value is set
                if (rules.defaultVal === undefined) {
                    // Throw an error
                    return rules.field + ' cannot be empty';
                }
                // If there is default value for the field
                return true;
            }
            // Else validation passed (is not empty)
            return false;
        },

        // Check if value is not empty and unique for the given dataType
        unique: function(formData, fieldName, rules, isSoft) {

            var emptyStatus = this.isEmpty(formData[fieldName], rules);
            // If empty return error message if shouldn't be empty, 'true' otherwise
            if (emptyStatus === true ||
                (!isSoft && emptyStatus !== false)) {
                return emptyStatus;
            }

            var trimValue = formData[fieldName].trim();
            var dataArray = rules.getDataArray();
            // For each object in Model
            for (var i = 0; i < dataArray.length; i++) {
                // If there is the same value as user wants to save
                if (dataArray[i][fieldName].toUpperCase() == trimValue.toUpperCase() &&
                        // And user creates a new record or it's not the record user modifies
                        (formData.id === undefined ||
                         formData.id != dataArray[i].id)
                ) {
                    return rules.field + ' must be unique';
                }
            }

            return true;
        },

        // Check if value is not empty and yyyy-mm-dd date format
        dateFormat: function(formData, fieldName, rules, isSoft) {

            var emptyStatus = this.isEmpty(formData[fieldName], rules);
            // If empty return error message if shouldn't be empty, 'true' otherwise
            if (emptyStatus === true ||
                (!isSoft && emptyStatus !== false)
            ) {
                return emptyStatus;
            }

            if (!Util.isRightDateFormat(formData[fieldName])) {
                return '%s must be in yyyy-mm-dd format'.replace('%s', rules.field);
            }

            return true;
        },

        // Check if value is one of select options
        selectOption: function(formData, fieldName, rules, isSoft) {

            var emptyStatus = this.isEmpty(formData[fieldName], rules);
            // If empty return error message if shouldn't be empty, 'true' otherwise
            if (emptyStatus === true ||
                (!isSoft && emptyStatus !== false)
            ) {
                return emptyStatus;
            }

            if (formData[fieldName] === 'other') {
                return true;
            }

            // If selecting from Model objects (by ids)
            // if (rules.getDataArray !== undefined) {
            //     var dataArray = rules.getDataArray();
            //     for (var i = 0; i < dataArray.length; i++) {
            //         if (dataArray[i].id == formData[fieldName]) {
            //             return true;
            //         };
            //     };
            // };
            // If selecting from array of options
            // if (rules.getArrayOfOptions !== undefined) {
                var arrayOfOptions = rules.getArrayOfOptions();
                if (arrayOfOptions.indexOf(formData[fieldName].toString()) !== -1) {
                    return true;
                }
            // };

            return 'Choose from existing ' + rules.field + ' options';
        },

        // Check if the vlue is a number
        // additional quality checks:
        // round number, number within min and max
        number: function(formData, fieldName, rules, isSoft) {

            var emptyStatus = this.isEmpty(formData[fieldName], rules);
            // If empty return error message if shouldn't be empty, 'true' otherwise
            if (emptyStatus === true ||
                (!isSoft && emptyStatus !== false)
            ) {
                return emptyStatus;
            }

            // If value is a number
            if (Util.isNumber(formData[fieldName])) {
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
                if (errors.length !== 0) {
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
            }
            // If value is not a number
            return rules.field + ' must be a number';
        },

        text: function(formData, fieldName, rules, isSoft) {

            var emptyStatus = this.isEmpty(formData[fieldName], rules);
            // If empty return error message if shouldn't be empty, 'true' otherwise
            if (emptyStatus === true ||
                (!isSoft && emptyStatus !== false)
            ) {
                return emptyStatus;
            }
            // I soft validation
            return true;
        },

        // Examples acceptable values:
        // 38.8897°, -77.0089°
        // 45.455678 56.452332
        // -15.0054 , -178.67
        coordinates: function(formData, fieldName, rules, isSoft) {

            var emptyStatus = this.isEmpty(formData[fieldName], rules);
            // If empty return error message if shouldn't be empty, 'true' otherwise
            if (emptyStatus === true ||
                (!isSoft && emptyStatus !== false)
            ) {
                return emptyStatus;
            }

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
            return rules.field + ' must be in Decimal Degrees formate';
        }
    }
};

module.exports = Validation;
