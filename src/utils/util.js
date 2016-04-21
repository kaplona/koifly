'use strict';


var Util = {

    /**
     * @param {string} monthIndex - represents month number
     * @returns {string} - short month name
     */
    getMonthName: function(monthIndex) {
        var monthNames = {
            '01': 'Jan',
            '02': 'Feb',
            '03': 'Mar',
            '04': 'Apr',
            '05': 'May',
            '06': 'Jun',
            '07': 'Jul',
            '08': 'Aug',
            '09': 'Sep',
            '10': 'Oct',
            '11': 'Nov',
            '12': 'Dec'
        };
        return monthNames[monthIndex];
    },


    /**
     * @returns {string} - today date in yyyy-mm-dd format
     */
    today: function() {
        var date = new Date();
        var dd = date.getDate();
        var mm = date.getMonth() + 1;
        var yyyy = date.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        return yyyy + '-' + mm + '-' + dd;
    },


    /**
     * @param {string} date
     * @returns {boolean} - whether the parsed date in yyyy-mm-dd format
     */
    isRightDateFormat: function(date) {
        var dateElements = date.split('-');

        return (
            dateElements.length === 3 &&
            dateElements[0] >= 1900 &&
            dateElements[0] <= 2099 &&
            dateElements[1] >= 1 &&
            dateElements[1] <= 12 &&
            dateElements[2] >= 1 &&
            dateElements[2] <= 31
        );
    },


    /**
     * @param {string} date - in yyyy-mm-dd format
     * @returns {string} - date in 'Jan 23, 2016' format
     */
    formatDate: function(date) {
        if (!this.isRightDateFormat(date)) {
            return null;
        }

        var dateElements = date.split('-');
        return `${this.getMonthName(dateElements[1])} ${parseInt(dateElements[2])} , ${dateElements[0]}`;
    },


    /**
     * @param {number} timeInMinutes
     * @returns {string} - time in '3 h 45 min' format
     */
    hoursMinutes: function(timeInMinutes) {
        if (timeInMinutes < 60) {
            return timeInMinutes + ' min';
        }

        var hours = Math.floor(timeInMinutes / 60);
        var minutes = timeInMinutes % 60;
        return hours + ' h ' + minutes + ' min';
    },


    /**
     * @param {number} number
     * @returns {string} - number with ordinal suffix like '1st' , '32nd' , '53rd' , '14th'
     */
    addOrdinalSuffix: function(number) {
        var lastDigit = number % 10;
        var twoLastDigits = number % 100;
        if (lastDigit === 1 && twoLastDigits !== 11) {
            return number + 'st';
        }
        if (lastDigit === 2 && twoLastDigits !== 12) {
            return number + 'nd';
        }
        if (lastDigit === 3 && twoLastDigits !== 13) {
            return number + 'rd';
        }
        return number + 'th';
    },


    /**
     * @param {string|number} val
     * @returns {boolean} - whether value is a number (or a string representing a number)
     */
    isNumber: function(val) {
        return !isNaN(val * 1);
    },


    /**
     * @param {string|number} val
     * @returns {boolean} - whether value is an integer (or a string representing an integer)
     */
    isInteger: function(val) {
        return (val * 1 % 1) === 0;
    },


    /**
     * @param {string|number} val
     * @param {number} min
     * @param {number} max
     * @returns {boolean} - whether value is a number within min and max limits (or a string representing a number)
     */
    isNumberWithin: function(val, min, max) {
        var number = val * 1;
        if (min !== undefined && number < min) {
            return false;
        }
        if (max !== undefined && number > max) {
            return false;
        }
        return true;
    },


    /**
     * Answers if parsed string is defined, not null and doesn't consist only of spaces
     * @param {null|string} [string]
     * @returns {boolean} - whether string is empty
     */
    isEmptyString: function(string) {
        return (!string || (string + '').trim() === '');
    },


    /**
     * @param {string} key
     * @returns {function()} - iteratee for reduce to get list of unique values of certain field
     */
    uniqueValues: function(key) {
        return (uniqueValues, nextItem) => {
            if (nextItem[key] && uniqueValues.indexOf(nextItem[key]) === -1) {
                uniqueValues.push(nextItem[key]);
            }
            return uniqueValues;
        };
    },


    /**
     * @param {string} valueKey
     * @param {string} textKey
     * @returns {function()} - iteratee for map to get value-text pairs
     */
    valueTextPairs: function(valueKey, textKey) {
        return item => {
            return {
                value: item[valueKey].toString(),
                text: item[textKey].toString()
            };
        };
    },


    /**
     * @param {object|null} coordinates - object with latitude and longitude ({ lat: number, lng: number })
     * @returns {string} - string representation of coordinates
     */
    coordinatesToString: function(coordinates) {
        return coordinates ? `${coordinates.lat} ${coordinates.lng}` : '';
    },


    /**
     * @param {string} string - string presentation of coordinates
     * @returns {{lat: number, lng: number}|null} - coordinates or null if not valid coordinates string
     */
    stringToCoordinates: function(string) {
        // Replace all degree characters by space
        // Split user input by reg:
        // any number of space | any number of ',' | space or ',' | any number of ',' | any number of space
        string = string.replace(/°/g, ' ').trim();
        var latLng = string.split(/\s*,*[,\s],*\s*/);

        if (latLng.length === 2 &&
            Util.isNumber(latLng[0]) &&
            Util.isNumber(latLng[1]) &&
            Util.isNumberWithin(latLng[0], -90, 90) &&
            Util.isNumberWithin(latLng[1], -180, 180)
        ) {
            return { lat: parseFloat(latLng[0]), lng: parseFloat(latLng[1]) };
        }

        return null;
    }
};


module.exports = Util;
