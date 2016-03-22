'use strict';


var Util = {

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

    timeNow: function() {
        var date = new Date();
        var hour = date.getHours();
        var min = date.getMinutes();
        var sec = date.getSeconds();

        if (hour < 10) {
            hour = '0' + hour;
        }

        if (min < 10) {
            min = '0' + min;
        }

        if (sec < 10) {
            sec = '0' + sec;
        }

        return hour + ':' + min + ':' + sec;
    },

    isRightDateFormat: function(date) {
        return (
            date.length === 10 &&
            date.substring(0, 4) >= 1900 &&
            date.substring(0, 4) <= 2099 &&
            date.substring(5, 7) >= 1 &&
            date.substring(5, 7) <= 12 &&
            date.substring(8) >= 1 &&
            date.substring(8) <= 31 &&
            date.substring(4, 5) === '-' &&
            date.substring(7, 8) === '-'
        );
    },

    formatDate: function(date) {
        if (!this.isRightDateFormat(date)) {
            return null;
        }

        var dateParts = date.split('-');
        return `${this.getMonthName(dateParts[1])} ${parseInt(dateParts[2])} , ${dateParts[0]}`;
    },

    isNumber: function(val) {
        return !isNaN(val * 1);
    },

    isInteger: function(val) {
        return (val * 1 % 1) === 0;
    },

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

    hoursMinutes: function(timeInMinutes) {
        if (timeInMinutes < 60) {
            return timeInMinutes + ' min';
        }

        var hours = Math.floor(timeInMinutes / 60);
        var minutes = timeInMinutes % 60;
        return hours + ' h ' + minutes + ' min';
    },

    addOrdinalSuffix: function(number) {
        var lastDigit = number % 10;
        var twoLastDigits = number % 100;
        if (lastDigit == 1 && twoLastDigits != 11) {
            return number + 'st';
        }
        if (lastDigit == 2 && twoLastDigits != 12) {
            return number + 'nd';
        }
        if (lastDigit == 3 && twoLastDigits != 13) {
            return number + 'rd';
        }
        return number + 'th';
    },


    /**
     * Answers if parsed string is defined, not null and doesn't consist only of spaces
     * @param {null|string} [string]
     * @returns {boolean} - if string has not empty value
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
        return (item) => {
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
