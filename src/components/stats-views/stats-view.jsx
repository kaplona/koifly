'use strict';

const React = require('react');
const Altitude = require('../../utils/altitude');
const chartService = require('../../services/chart-service');
const FlightModel = require('../../models/flight');
const PublicLinksMixin = require('../mixins/public-links-mixin');
const SiteModel = require('../../models/site');
const Util = require('../../utils/util');

const BubbleChart = require('../common/charts/buble-chart');
const ErrorBox = require('../common/notice/error-box');
const HistogramChart = require('../common/charts/histogram-chart');
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const NavigationMenu = require('../common/menu/navigation-menu');
const PieChart = require('../common/charts/pie-chart');
const Section = require('../common/section/section');
const SectionLoader = require('../common/section/section-loader');
const SectionRow = require('../common/section/section-row');
const View = require('../common/view');

require('./stats-view.less');


const StatsView = React.createClass({

    mixins: [ PublicLinksMixin ],

    getInitialState: function() {
        return {
            flightIds: [],
            flightStats: null,
            isLoading: true,
            loadingError: null,
            selectedSiteId: null,
            selectedYear: null,
            selectedMonth: null,
        };
    },

    handleStoreModified() {
        const flightStats = chartService.getFlightStatsForEachSite();
        if (!flightStats) {
            return;
        }
        if (flightStats && flightStats.error) {
            this.setState({
                loadingError: flightStats.error,
                isLoading: false,
            });
            return;
        }

        this.setState({
            flightStats,
            loadingError: null,
            isLoading: false,
        });
    },

    handleSiteSelect(siteId) {
        const selectedSiteId = (this.state.selectedSiteId === siteId) ? null : siteId;
        this.setState({ selectedSiteId, flightIds: [] });
    },

    handleTimeRangeSelect(timeRange) {
        if (!this.state.selectedYear) {
            this.setState({ selectedYear: timeRange, flightIds: [] });
        } else if (!this.state.selectedMonth) {
            this.setState({ selectedMonth: timeRange, flightIds: [] });
        }
    },

    handleRemoveSiteId() {
        this.setState({ selectedSiteId: null, flightIds: [] });
    },

    handleRemoveYear() {
        this.setState({ selectedYear: null, selectedMonth: null, flightIds: [] });
    },

    handleRemoveMonth() {
        this.setState({ selectedMonth: null, flightIds: [] });
    },

    handleBubbleClick(flightIds) {
        this.setState({ flightIds });
    },

    renderSimpleLayout(children) {
        return (
            <View onStoreModified={ this.handleStoreModified } error={ this.state.loadingError }>
                <MobileTopMenu header='Stats' />
                <NavigationMenu currentView='stats' />
                { children }
            </View>
        );
    },

    render() {
        if (this.state.loadingError) {
            return this.renderSimpleLayout(
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleStoreModified } />
            );
        }

        if (this.state.isLoading) {
            return this.renderSimpleLayout(<SectionLoader />);
        }

        const { selectedSiteId, selectedYear } = this.state;
        const selectedMonthIndex = Util.shortMonthNames.indexOf(this.state.selectedMonth) + 1;
        const flightNumberBySitePie = [{
            // colorByPoint: true,
            data: [],
        }];
        const airtimeBySitePie = [{
            // colorByPoint: true,
            data: [],
        }];
        const flightNumberHistogram = [];
        const airtimeHistogram = [];
        const maxAltitudeBubble = [{ data: [] }];
        let timeRangeCategories;
        if (this.state.flightStats) {
            this.state.flightStats.bySite.forEach(stats => {
                const piePoint = {
                    siteId: stats.siteId,
                    name: stats.siteName,
                    color: stats.siteColor,
                    sliced: (stats.siteId === selectedSiteId),
                };
                const histogramPoint = {
                    id: stats.siteId,
                    name: stats.siteName,
                    color: stats.siteColor,
                };
                function getBubblePoint(bucket, categoryIndex) {
                    return {
                        x: categoryIndex,
                        y: bucket ? bucket.mid : 0,
                        z: bucket ? bucket.flightIds.length : 0,
                        name: stats.siteName,
                        color: bucket ? stats.siteColor : 'rgba(255,255,255,0)',
                        from: bucket ? bucket.from : 0,
                        to: bucket ? bucket.to : 0,
                        flightIds: bucket ? bucket.flightIds : [],
                    };
                }

                let flightNum = 0;
                let airtime = 0;
                const flightNumHistogramData = [];
                const airtimeHistogramData = [];
                if (selectedYear && selectedMonthIndex) {
                    if (stats.yearly[selectedYear] && stats.yearly[selectedYear].monthly[selectedMonthIndex]) {
                        flightNum = stats.yearly[selectedYear].monthly[selectedMonthIndex].totalFlightNum;
                        airtime = stats.yearly[selectedYear].monthly[selectedMonthIndex].totalAirtime;
                    }

                    const daysInMonth = Util.getDaysInMonth(selectedYear, selectedMonthIndex);
                    timeRangeCategories = [];
                    for (let i = 1; i <= daysInMonth; i++) {
                        timeRangeCategories.push(i);
                        if (
                            !(stats.yearly[selectedYear] && stats.yearly[selectedYear].monthly[selectedMonthIndex] && stats.yearly[selectedYear].monthly[selectedMonthIndex].daily[i]) ||
                            (selectedSiteId && stats.siteId !== selectedSiteId)
                        ) {
                            flightNumHistogramData.push(0);
                            airtimeHistogramData.push(0);
                            maxAltitudeBubble[0].data.push(getBubblePoint(null, i - 1));
                            continue;
                        }
                        flightNumHistogramData.push(stats.yearly[selectedYear].monthly[selectedMonthIndex].daily[i].totalFlightNum);
                        airtimeHistogramData.push(stats.yearly[selectedYear].monthly[selectedMonthIndex].daily[i].totalAirtime);
                        stats.yearly[selectedYear].monthly[selectedMonthIndex].daily[i].maxAltBuckets.forEach(bucket => {
                            // Bubble chart x-axis value is an index of a category, in this case day of a month.
                            maxAltitudeBubble[0].data.push(getBubblePoint(bucket, i - 1));
                        });
                    }
                } else if (selectedYear) {
                    if (stats.yearly[selectedYear]) {
                        flightNum = stats.yearly[selectedYear].totalFlightNum;
                        airtime = stats.yearly[selectedYear].totalAirtime;
                    }
                    timeRangeCategories = Util.shortMonthNames;
                    for (let i = 1; i <= 12; i++) {
                        if (
                            !(stats.yearly[selectedYear] && stats.yearly[selectedYear].monthly[i]) ||
                            (selectedSiteId && stats.siteId !== selectedSiteId)
                        ) {
                            flightNumHistogramData.push(0);
                            airtimeHistogramData.push(0);
                            maxAltitudeBubble[0].data.push(getBubblePoint(null, i - 1));
                            continue;
                        }
                        flightNumHistogramData.push(stats.yearly[selectedYear].monthly[i].totalFlightNum);
                        airtimeHistogramData.push(stats.yearly[selectedYear].monthly[i].totalAirtime);
                        stats.yearly[selectedYear].monthly[i].maxAltBuckets.forEach(bucket => {
                            // Bubble chart x-axis value is an index of a category, in this case month.
                            maxAltitudeBubble[0].data.push(getBubblePoint(bucket, i - 1));
                        });
                    }
                } else {
                    flightNum = stats.totalFlightNum;
                    airtime = stats.totalAirtime;
                    timeRangeCategories = this.state.flightStats.years;
                    this.state.flightStats.years.forEach(flightYear => {
                        if (!stats.yearly[flightYear] || (selectedSiteId && stats.siteId !== selectedSiteId)) {
                            flightNumHistogramData.push(0);
                            airtimeHistogramData.push(0);
                            return;
                        }
                        flightNumHistogramData.push(stats.yearly[flightYear].totalFlightNum);
                        airtimeHistogramData.push(stats.yearly[flightYear].totalAirtime);
                        stats.yearly[flightYear].maxAltBuckets.forEach(bucket => {
                            maxAltitudeBubble[0].data.push(getBubblePoint(bucket, flightYear));
                        });
                    });
                }

                flightNumberBySitePie[0].data.push(Object.assign({}, piePoint, { y: flightNum }));
                airtimeBySitePie[0].data.push(Object.assign({}, piePoint, { y: airtime }));
                flightNumberHistogram.push(Object.assign({}, histogramPoint, { data: flightNumHistogramData }));
                airtimeHistogram.push(Object.assign({}, histogramPoint, { data: airtimeHistogramData }));
            });
        }

        const bubbleFlights = this.state.flightIds
            .map(flightId => FlightModel.getItemOutput(flightId))
            .filter(flight => !!flight && !flight.error);

        return (
            <View onStoreModified={ this.handleStoreModified }>
                <MobileTopMenu header='Stats' />
                <NavigationMenu currentView='stats' />

                <Section>
                    <SectionRow isLast={true}>
                        <div>
                            Selected site: {SiteModel.getSiteName(this.state.selectedSiteId) || 'None'}
                            {!!this.state.selectedSiteId && (
                                <div className='stats-view__cancel' onClick={this.handleRemoveSiteId}>x</div>
                            )}
                        </div>
                        <div>
                            Selected year: {this.state.selectedYear || 'None'}
                            {!!this.state.selectedYear && (
                                <div className='stats-view__cancel' onClick={this.handleRemoveYear}>x</div>
                            )}
                        </div>
                        <div>
                            Selected month: {this.state.selectedMonth || 'None'}
                            {!!this.state.selectedMonth && (
                                <div className='stats-view__cancel' onClick={this.handleRemoveMonth}>x</div>
                            )}
                        </div>

                        <div className='stats-view__pie'>
                            <PieChart
                                chartData={flightNumberBySitePie}
                                id='flightNumberBySitePie'
                                onClick={this.handleSiteSelect}
                            />
                        </div>
                        <div className='stats-view__pie'>
                            <PieChart
                                chartData={airtimeBySitePie}
                                id='airtimeBySitePie'
                                onClick={this.handleSiteSelect}
                            />
                        </div>

                        <HistogramChart
                            canSelect={!this.state.selectedMonth}
                            categories={timeRangeCategories}
                            chartData={flightNumberHistogram}
                            id='flightNumberHistogram'
                            title='Number of flights'
                            onClick={this.handleTimeRangeSelect}
                        />
                        <HistogramChart
                            canSelect={!this.state.selectedMonth}
                            categories={timeRangeCategories}
                            chartData={airtimeHistogram}
                            id='airtimeHistogram'
                            title='Airtime'
                            onClick={this.handleTimeRangeSelect}
                        />

                        <BubbleChart
                            categories={timeRangeCategories}
                            chartData={maxAltitudeBubble}
                            title='Max Altitude'
                            onClick={this.handleBubbleClick}
                        />

                        {!!bubbleFlights.length && (
                            <table className='stats-view__flights-table'>
                                <tbody>
                                {bubbleFlights.map((flight, index) => (
                                    <tr key={flight.id}>
                                        <td><a href={`/flight/${flight.id}`}>Flight {index + 1}:</a></td>
                                        <td>{Util.formatDate(flight.date)}</td>
                                        <td>{flight.siteName}</td>
                                        <td>{Altitude.formatAltitudeShort(flight.altitude)}</td>
                                        <td>{Util.formatTime(flight.airtime)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </SectionRow>
                </Section>
            </View>
        );
    }
});


module.exports = StatsView;
