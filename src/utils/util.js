'use strict';


var Util = {
    getMonthName: function(monthIndex) {
        var monthNames = {
            '01': 'January',
            '02': 'February',
            '03': 'March',
            '04': 'April',
            '05': 'May',
            '06': 'June',
            '07': 'July',
            '08': 'August',
            '09': 'September',
            '10': 'October',
            '11': 'November',
            '12': 'December'
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
        if (date.length != 10 ||
            date.substring(0, 4) < 1900 ||
            date.substring(0, 4) > 2099 ||
            date.substring(5, 7) < 1 ||
            date.substring(5, 7) > 12 ||
            date.substring(8) < 1 ||
            date.substring(8) > 31 ||
            date.substring(4, 5) != '-' ||
            date.substring(7, 8) != '-'
        ) {
            return false;
        }

        return true;
    },

    isNumber: function(val) {
        return !isNaN(val * 1);
    },

    isInteger: function(val) {
        return (val * 1 % 1) === 0;
    },

    isNumberWithin: function(number, min, max) {
        if (min !== undefined && number < min) {
            return false;
        }
        if (max !== undefined && number > max) {
            return false;
        }
        return true;
    },

    hoursMinutes: function(timeInMinutes) {
        var hours = Math.floor(timeInMinutes / 60);
        var minutes = timeInMinutes % 60;
        return hours + ' h ' + minutes + ' min';
    }
};

module.exports = Util;



