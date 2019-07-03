import React from 'react';
import { arrayOf, func, number, oneOfType, shape, string } from 'prop-types';
import Highcharts from 'highcharts';

require('highcharts/highcharts-more')(Highcharts);


export default class BubbleChart extends React.Component {
  componentDidMount() {
    // Need to assign a props callback or value to a local variable,
    // since `this` keyword will be pointing to some Highcharts class instance in any functions passed to Highcharts.
    // Check which context is applied to which functions in Highcharts documentation.
    const onClick = this.props.onClick;
    const altitudeUnit = this.props.altitudeUnit;

    this.chart = Highcharts.chart({
      chart: {
        renderTo: this.props.id,
        type: 'bubble'
      },
      title: { text: null },
      xAxis: {
        categories: this.props.categories
      },
      yAxis: {
        title: { text: null },
        min: 0
      },
      plotOptions: {
        series: {
          events: {
            click: function(event) {
              onClick(event.point.flightIds);
            }
          }
        },
        bubble: {
          cursor: 'pointer',
          opacity: 0.4,
          minSize: 5,
          maxSize: 30
        }
      },
      tooltip: {
        formatter: function() {
          const point = this.point;
          return `
            <b>${point.x}</b>
            <br/>
            ${point.name}: <b>${point.z}</b> flights
            <br/>
            (${point.from} ${altitudeUnit} - ${point.to} ${altitudeUnit})
          `;
        }
      },
      legend: { enabled: false },
      credits: { enabled: false },
      series: this.props.chartData
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.chartData !== this.props.chartData) {
      this.chart.update({
        xAxis: {
          categories: this.props.categories
        },
        series: this.props.chartData
      }, true, false);
    }
  }

  render() {
    const style = { width: '100%', height: '200px' };

    return (
      <div id={this.props.id} style={style}/>
    );
  }
}


BubbleChart.defaultProps = {
  id: 'bubbleChart'
};

BubbleChart.propTypes = {
  altitudeUnit: string,
  categories: arrayOf(oneOfType([string, number])),
  chartData: arrayOf(shape({
    data: arrayOf(shape({
      x: number.isRequired,
      y: number.isRequired,
      z: number.isRequired,
      name: string.isRequired,
      color: string.isRequired,
      from: number.isRequired,
      to: number.isRequired,
      flightIds: arrayOf(oneOfType([string, number]))
    })).isRequired
  })).isRequired,
  id: string, // pass it if there is several charts of the same type on the page.
  onClick: func.isRequired
};
