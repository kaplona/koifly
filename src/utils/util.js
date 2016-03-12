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
        var formattedDate = [
            this.getMonthName(dateParts[1]),
            parseInt(dateParts[2]) + ',',
            dateParts[0]
        ].join(' ');

        return formattedDate;
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
    }
};


module.exports = Util;
