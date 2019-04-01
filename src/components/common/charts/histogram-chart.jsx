'use strict';

const React = require('react');
const {arrayOf, bool, func, number, oneOfType, shape, string} = React.PropTypes;
const Highcharts = require('highcharts');


const HistogramChart = React.createClass({

    propTypes: {
        canSelect: bool,
        categories: arrayOf(oneOfType([string, number])),
        chartData: arrayOf(shape({
            name: string.isRequired,
            color: string,
            data: arrayOf(number).isRequired,
        })).isRequired,
        id: string, // pass it if there is several charts of the same type on the page.
        title: string,
        onClick: func.isRequired,
    },

    getDefaultProps: function() {
        return {
            canSelect: true,
            id: 'histogramChart',
            width: 200,
        };
    },

    componentDidMount() {
        // Need to assign a props callback to a local variable,
        // since `this` keyword will be pointing to a chart instance in any functions passed to Highcharts.
        const onClick = this.props.onClick;

        this.chart = Highcharts.chart({
            chart: {
                renderTo: this.props.id,
                type: 'column',
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
                min: 0,
                title: { text: null },
                stackLabels: {
                    enabled: true,
                    style: {
                        fontWeight: 'bold',
                        color: 'gray'
                    }
                }
            },
            tooltip: {
                headerFormat: '<b>{point.x}</b><br/>',
                pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: { enabled: false },
                    cursor: this.props.canSelect ? 'pointer' : 'default',
                    events: {
                        click: function(event) {
                            onClick(event.point.category);
                        }
                    },
                }
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
                plotOptions: {
                    column: {
                        cursor: nextProps.canSelect ? 'pointer' : 'default',
                    },
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


module.exports = HistogramChart;
