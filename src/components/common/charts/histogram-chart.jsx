'use strict';

const React = require('react');
const {arrayOf, bool, func, number, oneOfType, shape, string} = React.PropTypes;
const Highcharts = require('highcharts');
const Util = require('../../../utils/util');


const HistogramChart = React.createClass({

  propTypes: {
    canSelect: bool,
    categories: arrayOf(oneOfType([string, number])),
    chartData: arrayOf(shape({
      name: string.isRequired,
      color: string,
      data: arrayOf(number).isRequired
    })).isRequired,
    id: string, // pass it if there is several charts of the same type on the page.
    isAirtime: bool,
    onClick: func.isRequired
  },

  getDefaultProps: function () {
    return {
      canSelect: true,
      id: 'histogramChart',
      isAirtime: false
    };
  },

  componentDidMount() {
    // Need to assign a props callback or value to a local variable,
    // since `this` keyword will be pointing to some Highcharts class instance in any functions passed to Highcharts.
    // Check which context is applied to which functions in Highcharts documentation.
    const onClick = this.props.onClick;
    const isAirtime = this.props.isAirtime;

    this.chart = Highcharts.chart({
      chart: {
        renderTo: this.props.id,
        type: 'column'
      },
      title: {text: null},
      xAxis: {
        categories: this.props.categories
      },
      yAxis: {
        min: 0,
        title: {text: null},
        labels: {
          formatter: function () {
            return isAirtime ? Math.round(this.value / 60) : this.value;
          }
        },
        stackLabels: {
          enabled: true,
          formatter: function () {
            return isAirtime ? Util.formatTimeShort(this.total) : this.total;
          },
          style: {
            fontWeight: 'bold',
            color: 'gray'
          }
        }
      },
      tooltip: {
        headerFormat: '<b>{point.x}</b><br/>',
        pointFormatter: function () {
          const value = isAirtime ? Util.formatTime(this.y) : this.y;
          const totalValue = isAirtime ? Util.formatTime(this.stackTotal) : this.stackTotal;
          return `
                        ${this.series.name}: <b>${value}</b> (${Math.round(this.percentage)}%)
                        <br/>
                        Total: <b>${totalValue}</b>
                    `;
        }
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {enabled: false},
          cursor: this.props.canSelect ? 'pointer' : 'default',
          events: {
            click: function (event) {
              onClick(event.point.category);
            }
          }
        }
      },
      legend: {enabled: false},
      credits: {enabled: false},
      series: this.props.chartData
    });
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.chartData !== this.props.chartData) {
      this.chart.update({
        xAxis: {
          categories: nextProps.categories
        },
        plotOptions: {
          column: {
            cursor: nextProps.canSelect ? 'pointer' : 'default'
          }
        },
        series: nextProps.chartData
      }, true, false);
    }
  },

  shouldComponentUpdate() {
    return false;
  },

  render() {
    const style = {width: '100%', height: '200px'};

    return (
      <div id={this.props.id} style={style}/>
    );
  }
});


module.exports = HistogramChart;
