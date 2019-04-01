'use strict';

const React = require('react');
const {arrayOf, bool, func, number, shape, string} = React.PropTypes;
const Highcharts = require('highcharts');


const PieChart = React.createClass({

    propTypes: {
        chartData: arrayOf(shape({
            data: arrayOf(shape({
                color: string,
                name: string.isRequired,
                y: number.isRequired,
                sliced: bool,
            })).isRequired,
        })).isRequired,
        id: string, // pass it if there is several charts of the same type on the page.
        width: number,
        onClick: func.isRequired,
    },

    getDefaultProps: function() {
        return {
            id: 'pieChart',
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
                type: 'pie',
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
                    },
                }
            },
            tooltip: {
                pointFormat: '<b>{point.y}</b>'
            },
            legend: {enabled: false},
            credits: {enabled: false},
            series: this.props.chartData,
        });
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.chartData !== this.props.chartData) {
            this.chart.update({ series: nextProps.chartData }, true, false);
        }
    },

    shouldComponentUpdate() {
        return false;
    },

    render() {
        const style = {
            width: this.props.width + 'px',
            height: this.props.width + 'px'
        };

        return (
            <div id={this.props.id} style={style} />
        );
    }
});


module.exports = PieChart;
