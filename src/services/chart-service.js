import Altitude from '../utils/altitude';
import distanceService from './distance-service';
import FlightModel from '../models/flight';
import Highcharts from 'highcharts';
import objectValues from 'object.values';
import SiteModel from '../models/site';
import Util from '../utils/util';


const chartService = {

  _colors: [
    '#0AB2FF',
    '#6C3D3D',
    '#41A669',
    '#FFA509',
    '#AC67FA',
    '#FA6767',
    '#1D67A8',
    '#F3EE4C',
    '#84F34C',
    '#4C57F3',
    '#D24CF3',
    '#ACACAC',
    '#4CD7F3',
    '#E57A00',
    '#D4F060',
    '#38F2AE',
    '#8D54FF',
    '#FA9393',
    '#4E145C',
    '#6065F0'
  ],

  getColor(index) {
    return this._colors[index % this._colors.length];
  },

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
      type: 'line'
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
      };
    });

    return {
      color: '#FF0000',
      data: liftPoints,
      name: 'Lift',
      negativeColor: '#0088FF',
      type: 'area'
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
      };
    });

    return {
      color: Highcharts.getOptions().colors[2],
      data: distancePoints,
      name: 'Distance to launch',
      type: 'line'
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
      };
    });

    return {
      color: Highcharts.getOptions().colors[3],
      data: glideRatioPoints,
      name: 'Glide Ratio',
      type: 'line'
    };
  },

  getFlightStatsForEachSite() {
    const flights = FlightModel.getStoreContent();
    if (!flights || flights.error) {
      return flights;
    }

    const years = [];
    const siteList = SiteModel.getList();
    const siteStats = {};
    siteList.forEach((site, index) => {
      siteStats[site.id] = {
        siteId: site.id,
        siteName: site.name,
        launchAltitude: site.launchAltitude,
        totalAirtime: 0,
        totalFlightNum: 0,
        siteColor: this.getColor(index),
        yearly: {}
      };
    });

    const bucketHeight = 200; // meters
    function addToMaxAltBuckets(maxAltBuckets, flightBucket, flightId) {
      const existingBucket = maxAltBuckets.find(({ from }) => (from === flightBucket.from));
      if (existingBucket) {
        existingBucket.flightIds.push(flightId);
      } else {
        maxAltBuckets.push(Object.assign({}, flightBucket, { flightIds: [ flightId ] }));
        maxAltBuckets.sort((a, b) => (a.from - b.from));
      }
    }

    objectValues(flights).forEach(flight => {
      // Calculate flight max altitude bucket
      const siteAlt = siteStats[flight.siteId].launchAltitude;
      const bucketNumber = (flight.altitude - siteAlt) / bucketHeight;
      const from = (flight.altitude < siteAlt || bucketNumber < 1) ? 0 : Math.floor(bucketNumber) * bucketHeight + siteAlt;
      const to = (flight.altitude < siteAlt) ? (siteAlt + bucketHeight) : Math.ceil(bucketNumber) * bucketHeight + siteAlt;
      const mid = (to - bucketHeight / 2);
      const flightBucket = {
        from: Altitude.getAltitudeInPilotUnits(from),
        to: Altitude.getAltitudeInPilotUnits(to),
        mid: Altitude.getAltitudeInPilotUnits(mid)
      };

      // Total stats.
      siteStats[flight.siteId].totalAirtime += flight.airtime;
      siteStats[flight.siteId].totalFlightNum++;

      // Increment stats for flight year.
      const flightYear = Util.getDateYear(flight.date);
      if (!years.includes(flightYear)) {
        years.push(flightYear);
      }
      if (!siteStats[flight.siteId].yearly[flightYear]) {
        siteStats[flight.siteId].yearly[flightYear] = {
          totalAirtime: 0,
          totalFlightNum: 0,
          maxAltBuckets: [],
          monthly: {}
        };
      }
      siteStats[flight.siteId].yearly[flightYear].totalAirtime += flight.airtime;
      siteStats[flight.siteId].yearly[flightYear].totalFlightNum++;
      addToMaxAltBuckets(siteStats[flight.siteId].yearly[flightYear].maxAltBuckets, flightBucket, flight.id);

      // Increment stats for flight month.
      const flightMonth = Util.getDateMonth(flight.date);
      if (!siteStats[flight.siteId].yearly[flightYear].monthly[flightMonth]) {
        siteStats[flight.siteId].yearly[flightYear].monthly[flightMonth] = {
          totalAirtime: 0,
          totalFlightNum: 0,
          maxAltBuckets: [],
          daily: {}
        };
      }
      siteStats[flight.siteId].yearly[flightYear].monthly[flightMonth].totalAirtime += flight.airtime;
      siteStats[flight.siteId].yearly[flightYear].monthly[flightMonth].totalFlightNum++;
      addToMaxAltBuckets(siteStats[flight.siteId].yearly[flightYear].monthly[flightMonth].maxAltBuckets, flightBucket, flight.id);

      // Increment stats for flight day of the month.
      const flightDayOfMonth = Util.getDateDayOfMonth(flight.date);
      if (!siteStats[flight.siteId].yearly[flightYear].monthly[flightMonth].daily[flightDayOfMonth]) {
        siteStats[flight.siteId].yearly[flightYear].monthly[flightMonth].daily[flightDayOfMonth] = {
          totalAirtime: 0,
          totalFlightNum: 0,
          maxAltBuckets: []
        };
      }

      siteStats[flight.siteId].yearly[flightYear].monthly[flightMonth].daily[flightDayOfMonth].totalAirtime += flight.airtime;
      siteStats[flight.siteId].yearly[flightYear].monthly[flightMonth].daily[flightDayOfMonth].totalFlightNum++;
      addToMaxAltBuckets(siteStats[flight.siteId].yearly[flightYear].monthly[flightMonth].daily[flightDayOfMonth].maxAltBuckets, flightBucket, flight.id);
    });

    return {
      years: years.sort(),
      bySite: objectValues(siteStats)
    };
  }
};

export default chartService;
