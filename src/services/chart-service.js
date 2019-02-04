'use strict';

const Altitude = require('../utils/altitude');
const distanceService = require('./distance-service');
const Highcharts = require('highcharts');

const chartService = {

    /**
     * Composes chart series options for flight altitude visualisation.
     * @param {array.<{airtimeInSeconds:number, altInPilotUnit:number}>} flightPoints – Flight points from parsed IGC.
     * @return {{color:string, data:array, name:string, type:string}}
     */
    getAltitudeSeries(flightPoints) {
        const altitudePoints = flightPoints.map(point => ({
            x: point.airtimeInSeconds,
            y: point.altInPilotUnit
        }));

        return {
            color: Highcharts.getOptions().colors[0],
            data: altitudePoints,
            name: 'Altitude',
            type: 'line',
        };
    },

    /**
     * Composes chart series options for flight lift visualisation.
     * @param {array.<{airtimeInSeconds:number, altitude:number}>} flightPoints – Flight points from parsed IGC.
     * @param {string} unit – One of "m/s" or "ft/min" (see Altitude service for the full list)
     * @return {{color:string, data:array, name:string, type:string}}
     */
    getLiftSeries(flightPoints, unit) {
        const liftPoints = flightPoints.map((point, index) => {
            const prevPoint = flightPoints[index - 1] || {};
            const altitudeDiff = (point.altitude - prevPoint.altitude);
            const secDiff = (point.airtimeInSeconds - prevPoint.airtimeInSeconds);
            const lift = (index === 0) ? 0 : (altitudeDiff / secDiff);
            const liftInPilotUnits = (unit === 'm/s') ? lift : Altitude.getVelocityInGivenUnits(lift, unit);

            return {
                x: point.airtimeInSeconds,
                y: liftInPilotUnits
            }
        });

        return {
            color: '#FF0000',
            data: liftPoints,
            name: 'Lift',
            negativeColor: '#0088FF',
            type: 'area',
        };
    },

    /**
     * Composes chart series options for visualisation of how far from the launch each flight point is.
     * @param {array.<{airtimeInSeconds:number, lat:number, lng:number}>} flightPoints – Flight points from parsed IGC.
     * @param {string} unit – One of "km" or "mile" (see Distance service for the full list)
     * @return {{color:string, data:array, name:string, type:string}}
     */
    getDistanceFromLaunchSeries(flightPoints, unit) {
        const firstPoint = flightPoints[0];
        const launchCoords = { lat: firstPoint.lat, lng: firstPoint.lng };

        const distancePoints = flightPoints.map(point => {
            const distance = distanceService.getDistance(launchCoords.lat, launchCoords.lng, point.lat, point.lng);
            return {
                x: point.airtimeInSeconds,
                y: distanceService.getDistanceInGivenUnits(distance, unit)
            }
        });

        return {
            color: Highcharts.getOptions().colors[2],
            data: distancePoints,
            name: 'Distance to launch',
            type: 'line',
        };
    },

    /**
     * Composes chart series options for visualisation of what pilot glide ration to the landing place was
     * at each point of the flight.
     * @param {array.<{airtimeInSeconds:number, altitude:number, lat:number, lng:number}>} flightPoints – Flight points from parsed IGC.
     * @return {{color:string, data:array, name:string, type:string}}
     */
    getGlideRatioSeries(flightPoints) {
        const lastPoint = flightPoints[flightPoints.length - 1];
        const landingCoords = { lat: lastPoint.lat, lng: lastPoint.lng };
        const landingAlt = lastPoint.altitude;

        const glideRatioPoints = flightPoints.map(point => {
            const distance = distanceService.getDistance(landingCoords.lat, landingCoords.lng, point.lat, point.lng);
            const altitude = (point.altitude - landingAlt);
            return {
                x: point.airtimeInSeconds,
                y: (altitude > 10) ? distance / altitude : 0
            }
        });

        return {
            color: Highcharts.getOptions().colors[3],
            data: glideRatioPoints,
            name: 'Glide Ratio',
            type: 'line'
        };
    },
};

module.exports = chartService;
