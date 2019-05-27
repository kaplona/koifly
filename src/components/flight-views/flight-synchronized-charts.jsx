'use strict';

import React from 'react';
import { arrayOf, func, number, shape } from 'prop-types';
import Altitude from'../../utils/altitude';
import chartService from'../../services/chart-service';
import distanceService from'../../services/distance-service';
import Highcharts from'highcharts';

require('./flight-synchronized-charts.less');


export default class FlightSynchronizedCharts extends React.Component {
  componentDidMount() {
    if (!this.props.flightPoints || !this.props.flightPoints.length) {
      return;
    }

    // Adding a method to Highcharts Point prototype.
    // Highlight a point by showing tooltip, setting hover state and draw crosshair
    Highcharts.Point.prototype.koiHighlight = function(event) {
      event = this.series.chart.pointer.normalize(event);
      this.onMouseOver(); // Show the hover marker
      this.series.chart.tooltip.refresh(this); // Show the tooltip
      this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
    };

    this.createCharts();

    ['mousemove', 'touchmove', 'touchstart'].forEach(eventType => {
      document.getElementById('charts-container').addEventListener(eventType, this.handleChartHoverListener.bind(this));
    });

    // Override the reset function, we don't need to hide the tooltips and crosshairs.
    this.charts.forEach(chartInstance => {
      chartInstance.pointer.reset = function() {
        return undefined;
      };
    });
  }

  handleChartHoverListener(e) {
    this.charts.forEach(chart => {
      // Find coordinates within the chart
      const event = chart.pointer.normalize(e);
      // Get the hovered point
      const point = chart.series[0].searchPoint(event, true);
      if (point) {
        point.koiHighlight(e);
        this.props.onPointHover(point.index);
      }
    });
  }

  createCharts() {
    const pilotAltUnit = Altitude.getUserAltitudeUnitShort();
    const pilotAltVelocityUnit = Altitude.getUserVelocityUnit();
    const pilotDistanceUnit = distanceService.distanceUnits.km;
    const minAirtime = this.props.flightPoints[0].airtimeInSeconds;
    const maxAirtime = this.props.flightPoints[this.props.flightPoints.length - 1].airtimeInSeconds;

    const altChartConfig = {
      renderTo: 'altitude-chart',
      title: 'Altitude',
      tooltipPointFormatter: function() {
        return `<span>${this.y} ${pilotAltUnit}</span>`;
      },
      minYAxis: this.props.minAltitude,
      series: chartService.getAltitudeSeries(this.props.flightPoints)
    };

    const liftChartConfig = {
      renderTo: 'lift-chart',
      title: 'Lift',
      tooltipPointFormatter: function() {
        return `<span>${this.y} ${pilotAltVelocityUnit}</span>`;
      },
      series: chartService.getLiftSeries(this.props.flightPoints, pilotAltVelocityUnit)
    };

    const launchDistChartConfig = {
      renderTo: 'launch-distance-chart',
      title: 'Distance from launch',
      tooltipPointFormatter: function() {
        return `<span>${this.y} ${pilotDistanceUnit}</span>`;
      },
      series: chartService.getDistanceFromLaunchSeries(this.props.flightPoints, pilotDistanceUnit)
    };

    const glideRatioChartConfig = {
      renderTo: 'glide-ratio-chart',
      title: 'Glide ratio to landing spot',
      tooltipPointFormatter: function() {
        return this.y ? `<span>1 / ${Math.round(this.y)}</span>` : '0';
      },
      yAxisLabels: {
        formatter: function() {
          return this.value ? `1/${Math.round(this.value)}` : '0';
        }
      },
      series: chartService.getGlideRatioSeries(this.props.flightPoints)
    };

    this.charts = [
      this.createChartInstance(altChartConfig, minAirtime, maxAirtime),
      this.createChartInstance(liftChartConfig, minAirtime, maxAirtime),
      this.createChartInstance(launchDistChartConfig, minAirtime, maxAirtime),
      this.createChartInstance(glideRatioChartConfig, minAirtime, maxAirtime)
    ];
  }

  createChartInstance(config, minAirtime, maxAirtime) {
    return Highcharts.chart({
      chart: {
        renderTo: config.renderTo,
        type: 'line',
        marginLeft: 60, // Keep all charts left aligned
        spacingTop: 30,
        spacingBottom: 20
      },
      plotOptions: {
        area: {
          lineWidth: 1,
          marker: { enabled: false },
          states: {
            hover: { lineWidth: 1 }
          }
        },
        line: {
          lineWidth: 2,
          marker: { enabled: false },
          states: {
            hover: { lineWidth: 2 }
          }
        },
        series: {
          turboThreshold: 0
        }
      },
      title: {
        text: config.title,
        align: 'left',
        margin: 0,
        x: 50,
        y: 10
      },
      tooltip: {
        positioner: function() {
          return {
            x: this.chart.chartWidth - this.label.width, // right aligned
            y: 15 // align to title
          };
        },
        borderWidth: 0,
        backgroundColor: 'none',
        pointFormatter: config.tooltipPointFormatter,
        headerFormat: '',
        shadow: false,
        style: {
          fontSize: '18px'
        }
      },
      xAxis: {
        crosshair: true,
        labels: {
          formatter: function() {
            if (this.value === 0) {
              return '0';
            }
            if (maxAirtime < 5 * 60) {
              const min = Math.floor(this.value / 60);
              const sec = this.value % 60;
              return `${min}:${sec} min`;
            }

            const hour = Math.floor(this.value / 3600);
            const isRoundHour = (this.value % 3600) === 0;

            if (isRoundHour) {
              return `<b>${hour} h</b>`;
            }

            const min = Math.floor((this.value - hour * 3600) / 60);
            return `${min} min`;
          }
        },
        min: minAirtime,
        max: maxAirtime,
        tickInterval: this.getTickInterval(maxAirtime)
      },
      yAxis: {
        labels: config.yAxisLabels || {},
        min: config.minYAxis,
        startOnTick: false,
        title: { text: null }
      },
      legend: { enabled: false },
      credits: { enabled: false },
      series: [ config.series ]
    });
  }

  getTickInterval(maxAirtime) {
    const isSmallScreen = document.body.clientWidth < 600;
    if (maxAirtime < 5 * 60) {
      return 30;
    }
    if (maxAirtime < 10 * 60) {
      return 60;
    }
    if (maxAirtime > 5 * 3600) {
      return 3600;
    }

    // Depending on how many hours was the flight, tick every 5 min, 10 min, 15 min, etc.
    const hour = Math.floor(maxAirtime / 3600);
    return (hour + 1) * 5 * 60 * (isSmallScreen ? 2 : 1);
  }

  render() {
    if (!this.props.flightPoints || !this.props.flightPoints.length) {
      return null;
    }

    return (
      <div id='charts-container'>
        <div id='altitude-chart' className='chart'/>
        <div id='lift-chart' className='chart'/>
        <div id='launch-distance-chart' className='chart'/>
        <div id='glide-ratio-chart' className='chart'/>
      </div>
    );
  }
}


FlightSynchronizedCharts.propTypes = {
  flightPoints: arrayOf(shape({
    altInPilotUnit: number.isRequired,
    lat: number.isRequired,
    lng: number.isRequired,
    airtimeInSeconds: number.isRequired
  })),
  minAltitude: number,
  onPointHover: func.isRequired
};
