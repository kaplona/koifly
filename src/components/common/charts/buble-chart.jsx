'use strict';

const React = require('react');
const {arrayOf, func, number, oneOfType, shape, string} = React.PropTypes;
const Highcharts = require('highcharts');
require('highcharts/highcharts-more')(Highcharts);


const BubbleChart = React.createClass({

    propTypes: {
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
                flightIds: arrayOf(oneOfType([string, number])),
            })).isRequired,
        })).isRequired,
        id: string, // pass it if there is several charts of the same type on the page.
        title: string,
    },

    getDefaultProps: function() {
        return {
            id: 'bubbleChart',
        };
    },

    componentDidMount() {
        this.chart = Highcharts.chart({
            chart: {
                renderTo: this.props.id,
                type: 'bubble',
            },
            title: {
                text: this.props.title || null,
                align: 'left',
                margin: 0,
            },
            xAxis: {
                categories: this.props.categories,
            },
            yAxis: {
                title: { text: null },
                min: 0,
            },
            plotOptions: {
                bubble: {
                    opacity: 0.4,
                    minSize: 5,
                    maxSize: 30,
                },
            },
            tooltip: {
                headerFormat: '<b>{point.x}</b><br/>',
                pointFormat: '{point.name}: {point.z} flights<br/>from: {point.from}<br/>to: {point.to}'
            },
            legend: {enabled: false},
            credits: {enabled: false},
            series: this.props.chartData,
        });
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.chartData !== this.props.chartData) {
            this.chart.update({
                xAxis: {
                    categories: nextProps.categories,
                },
                series: nextProps.chartData
            }, true, false);
        }
    },

    shouldComponentUpdate() {
        return false;
    },

    render() {
        const style = {
            width: '100%',
            height: '200px',
        };

        return (
            <div id={this.props.id} style={style} />
        );
    }
});


module.exports = BubbleChart;
