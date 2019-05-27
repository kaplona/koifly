'use strict';

import React from 'react';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import Highcharts from 'highcharts';
import Util from '../../../utils/util';


export default class PieChart extends React.Component {
  componentDidMount() {
    // Need to assign a props callback or value to a local variable,
    // since `this` keyword will be pointing to some Highcharts class instance in any functions passed to Highcharts.
    // Check which context is applied to which functions in Highcharts documentation.
    const onClick = this.props.onClick;
    const isAirtime = this.props.isAirtime;

    this.chart = Highcharts.chart({
      chart: {
        renderTo: this.props.id,
        type: 'pie',
        margin: [0, 0, 0, 0]
      },
      title: { text: null },
      plotOptions: {
        pie: {
          cursor: 'pointer',
          dataLabels: { enabled: false },
          events: {
            click: function(event) {
              onClick(event.point.siteId);
            }
          }
        }
      },
      tooltip: {
        pointFormatter: function() {
          const value = isAirtime ? Util.formatTime(this.y) : this.y;
          return `<b>${value}</b>`;
        }
      },
      legend: { enabled: false },
      credits: { enabled: false },
      series: this.props.chartData
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.chartData !== this.props.chartData) {
      this.chart.update({ series: this.props.chartData }, true, false);
    }
  }

  render() {
    const style = {
      width: this.props.width + 'px',
      height: this.props.width + 'px'
    };

    return <div id={this.props.id} style={style}/>;
  }
}


PieChart.defaultProps = {
  id: 'pieChart',
  isAirtime: false,
  width: 200
};

PieChart.propTypes = {
  chartData: arrayOf(shape({
    data: arrayOf(shape({
      color: string,
      name: string.isRequired,
      y: number.isRequired,
      sliced: bool
    })).isRequired
  })).isRequired,
  id: string, // pass it if there is several charts of the same type on the page.
  isAirtime: bool,
  width: number,
  onClick: func.isRequired
};
