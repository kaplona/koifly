'use strict';

const React = require('react');
const Altitude = require('../../utils/altitude');
const chartService = require('../../services/chart-service');
const FlightModel = require('../../models/flight');
const PublicLinksMixin = require('../mixins/public-links-mixin');
const pubSub = require('../../utils/pubsub');
const SiteModel = require('../../models/site');
const statsViewStore = require('./stats-view-store');
const Util = require('../../utils/util');

const AppLink = require('../common/app-link');
const BubbleChart = require('../common/charts/buble-chart');
const Button = require('../common/buttons/button');
const DropdownInput = require('../common/inputs/dropdown-input');
const ErrorBox = require('../common/notice/error-box');
const HistogramChart = require('../common/charts/histogram-chart');
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const NavigationMenu = require('../common/menu/navigation-menu');
const PieChart = require('../common/charts/pie-chart');
const Section = require('../common/section/section');
const SectionLoader = require('../common/section/section-loader');
const SectionRow = require('../common/section/section-row');
const SectionTitle = require('../common/section/section-title');
const View = require('../common/view');

require('./stats-view.less');


const StatsView = React.createClass({

    mixins: [ PublicLinksMixin ],

    getInitialState: function() {
        return {
            flightStats: null,
            isLoading: true,
            loadingError: null,
            selectedFlightIds: statsViewStore.selectedFlightIds,
            selectedSiteId: statsViewStore.selectedSiteId,
            selectedYear: statsViewStore.selectedYear,
            selectedMonth: statsViewStore.selectedMonth,
        };
    },

    componentDidMount: function() {
        pubSub.on(statsViewStore.events.STATS_VIEW_STORE_UPDATED, this.handleStatsViewStoreModified, this);
    },

    componentWillUnmount: function() {
        pubSub.removeListener(statsViewStore.events.STATS_VIEW_STORE_UPDATED, this.handleStatsViewStoreModified, this);
    },

    handleStatsViewStoreModified() {
        this.setState({
            selectedFlightIds: statsViewStore.selectedFlightIds,
            selectedSiteId: statsViewStore.selectedSiteId,
            selectedYear: statsViewStore.selectedYear,
            selectedMonth: statsViewStore.selectedMonth,
        });
    },

    handleDataStoreModified() {
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
        statsViewStore.updateState({ selectedSiteId, selectedFlightIds: [] });
    },

    handleTimeRangeSelect(timeRange) {
        if (!this.state.selectedYear) {
            statsViewStore.updateState({ selectedYear: timeRange, selectedFlightIds: [] });
        } else if (!this.state.selectedMonth) {
            statsViewStore.updateState({ selectedMonth: timeRange, selectedFlightIds: [] });
        }
    },

    handleYearSelect(year) {
        if (year) {
            statsViewStore.updateState({ selectedYear: year, selectedFlightIds: [] });
        } else {
            statsViewStore.updateState({ selectedYear: null, selectedMonth: null, selectedFlightIds: [] });
        }
    },

    handleMonthSelect(monthShort) {
        statsViewStore.updateState({ selectedMonth: monthShort, selectedFlightIds: [] });
    },

    handleUnzoom() {
        if (this.state.selectedMonth) {
            this.handleMonthSelect(null);
        } else if (this.state.selectedYear) {
            this.handleYearSelect(null);
        }
    },

    handleBubbleClick(flightIds) {
        statsViewStore.updateState({ selectedFlightIds: flightIds });
    },

    getChartData() {
        const selectedMonthIndex = Util.shortMonthNames.indexOf(this.state.selectedMonth) + 1;
        const flightNumberBySitePie = [{ data: [] }];
        const airtimeBySitePie = [{ data: [] }];
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
                    sliced: (stats.siteId === this.state.selectedSiteId),
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

                if (this.state.selectedYear && selectedMonthIndex) {
                    const yearStats = stats.yearly[this.state.selectedYear] || null;
                    const monthStats = yearStats ? yearStats.monthly[selectedMonthIndex] || null : null;
                    const daysInMonth = Util.getDaysInMonth(this.state.selectedYear, selectedMonthIndex);
                    flightNum = monthStats ? monthStats.totalFlightNum : 0;
                    airtime = monthStats ? monthStats.totalAirtime : 0;
                    timeRangeCategories = [];
                    for (let i = 1; i <= daysInMonth; i++) {
                        timeRangeCategories.push(i);
                        const dayStats = monthStats ? monthStats.daily[i] || null : null;
                        if (!dayStats || (this.state.selectedSiteId && stats.siteId !== this.state.selectedSiteId)) {
                            flightNumHistogramData.push(0);
                            airtimeHistogramData.push(0);
                            maxAltitudeBubble[0].data.push(getBubblePoint(null, i - 1));
                            continue;
                        }
                        flightNumHistogramData.push(dayStats.totalFlightNum);
                        airtimeHistogramData.push(dayStats.totalAirtime);
                        dayStats.maxAltBuckets.forEach(bucket => {
                            // Bubble chart x-axis value is an index of a category, in this case day of a month.
                            maxAltitudeBubble[0].data.push(getBubblePoint(bucket, i - 1));
                        });
                    }
                } else if (this.state.selectedYear) {
                    const yearStats = stats.yearly[this.state.selectedYear] || null;
                    flightNum = yearStats ? yearStats.totalFlightNum : 0;
                    airtime = yearStats ? yearStats.totalAirtime : 0;
                    timeRangeCategories = Util.shortMonthNames;
                    for (let i = 1; i <= 12; i++) {
                        const monthStats = yearStats ? yearStats.monthly[i] || null : null;
                        if (!monthStats || (this.state.selectedSiteId && stats.siteId !== this.state.selectedSiteId)) {
                            flightNumHistogramData.push(0);
                            airtimeHistogramData.push(0);
                            maxAltitudeBubble[0].data.push(getBubblePoint(null, i - 1));
                            continue;
                        }
                        flightNumHistogramData.push(monthStats.totalFlightNum);
                        airtimeHistogramData.push(monthStats.totalAirtime);
                        monthStats.maxAltBuckets.forEach(bucket => {
                            // Bubble chart x-axis value is an index of a category, in this case month.
                            maxAltitudeBubble[0].data.push(getBubblePoint(bucket, i - 1));
                        });
                    }
                } else {
                    flightNum = stats.totalFlightNum;
                    airtime = stats.totalAirtime;
                    timeRangeCategories = this.state.flightStats.years;
                    this.state.flightStats.years.forEach(flightYear => {
                        const yearStats = stats.yearly[flightYear] || null;
                        if (!yearStats || (this.state.selectedSiteId && stats.siteId !== this.state.selectedSiteId)) {
                            flightNumHistogramData.push(0);
                            airtimeHistogramData.push(0);
                            return;
                        }
                        flightNumHistogramData.push(yearStats.totalFlightNum);
                        airtimeHistogramData.push(yearStats.totalAirtime);
                        yearStats.maxAltBuckets.forEach(bucket => {
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

        return {
            flightNumberBySitePie,
            airtimeBySitePie,
            flightNumberHistogram,
            airtimeHistogram,
            maxAltitudeBubble,
            timeRangeCategories
        };
    },

    renderSimpleLayout(children) {
        return (
            <View onStoreModified={ this.handleDataStoreModified } error={ this.state.loadingError }>
                <MobileTopMenu header='Stats' />
                <NavigationMenu currentView='stats' />
                { children }
            </View>
        );
    },

    renderUnzoomButton() {
        if (this.state.selectedYear) {
            return (
                <div className='stats-view__unzoom'>
                    <Button
                        caption={this.state.selectedMonth ? '< Months' : '< Years'}
                        fitContent={true}
                        isAllScreens={true}
                        isSmall={true}
                        onClick={this.handleUnzoom}
                    />
                </div>
            );
        }
    },

    render() {
        if (this.state.loadingError) {
            return this.renderSimpleLayout(
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleDataStoreModified } />
            );
        }

        if (this.state.isLoading) {
            return this.renderSimpleLayout(<SectionLoader />);
        }

        const {
            flightNumberBySitePie,
            airtimeBySitePie,
            flightNumberHistogram,
            airtimeHistogram,
            maxAltitudeBubble,
            timeRangeCategories
        } = this.getChartData();

        const siteOptions = SiteModel.getSiteValueTextList();
        const yearOptions = this.state.flightStats.years.map(year => ({ value: year, text: year }));
        const monthOptions = Util.shortMonthNames.map(month => ({ value: month, text: month }));
        const bubbleFlights = this.state.selectedFlightIds
            .map(flightId => FlightModel.getItemOutput(flightId))
            .filter(flight => !!flight && !flight.error);

        return (
            <View onStoreModified={ this.handleDataStoreModified }>
                <MobileTopMenu header='Stats' />
                <NavigationMenu currentView='stats' />

                <Section>
                    <SectionTitle>
                        Stats filters:
                    </SectionTitle>

                    <SectionRow>
                        <DropdownInput
                            selectedValue={ this.state.selectedSiteId }
                            options={ siteOptions }
                            labelText='Selected site:'
                            emptyText='All sites'
                            onChangeFunc={ (inputName, inputValue) => {
                                this.handleSiteSelect(inputValue ? Number(inputValue) : inputValue);
                            } }
                        />
                    </SectionRow>

                    <SectionRow>
                        <DropdownInput
                            selectedValue={ this.state.selectedYear }
                            options={ yearOptions }
                            labelText='Selected year:'
                            emptyText='All time'
                            onChangeFunc={ (inputName, inputValue) => {
                                this.handleYearSelect(inputValue ? Number(inputValue) : null);
                            } }
                        />
                    </SectionRow>

                    <SectionRow isLast={ true }>
                        <DropdownInput
                            selectedValue={ this.state.selectedMonth }
                            options={ monthOptions }
                            labelText='Selected month:'
                            emptyText='All time'
                            noSort={ true }
                            onChangeFunc={ (inputName, inputValue) => this.handleMonthSelect(inputValue) }
                        />
                    </SectionRow>

                    <SectionRow>
                        <div className='stats-view__description'>
                            Or click on the charts to select corresponding site or time range.
                        </div>
                    </SectionRow>

                    <SectionRow isLast={true}>
                        <div className='stats-view__pie-container'>
                            <div className='stats-view__chart-title'>Total number of flights</div>
                            <div className='stats-view__pie'>
                                <PieChart
                                    chartData={flightNumberBySitePie}
                                    id='flightNumberBySitePie'
                                    onClick={this.handleSiteSelect}
                                />
                            </div>
                        </div>
                        <div className='stats-view__pie-container'>
                            <div className='stats-view__chart-title'>Total airtime</div>
                            <div className='stats-view__pie'>
                                <PieChart
                                    chartData={airtimeBySitePie}
                                    id='airtimeBySitePie'
                                    isAirtime={true}
                                    onClick={this.handleSiteSelect}
                                />
                            </div>
                        </div>

                        <div className='stats-view__chart-title-container'>
                            <div className='stats-view__chart-title'>Number of flights</div>
                            {this.renderUnzoomButton()}
                        </div>
                        <HistogramChart
                            canSelect={!this.state.selectedMonth}
                            categories={timeRangeCategories}
                            chartData={flightNumberHistogram}
                            id='flightNumberHistogram'
                            onClick={this.handleTimeRangeSelect}
                        />

                        <div className='stats-view__chart-title-container'>
                            <div className='stats-view__chart-title'>Airtime</div>
                            {this.renderUnzoomButton()}
                        </div>
                        <HistogramChart
                            canSelect={!this.state.selectedMonth}
                            categories={timeRangeCategories}
                            chartData={airtimeHistogram}
                            id='airtimeHistogram'
                            isAirtime={true}
                            onClick={this.handleTimeRangeSelect}
                        />

                        <div className='stats-view__chart-title'>Max altitude</div>
                        <BubbleChart
                            altitudeUnit={Altitude.getUserAltitudeUnitShort()}
                            categories={timeRangeCategories}
                            chartData={maxAltitudeBubble}
                            onClick={this.handleBubbleClick}
                        />

                        {!!bubbleFlights.length && (
                            <table className='stats-view__flights-table'>
                                <tbody>
                                {bubbleFlights.map((flight, index) => (
                                    <tr key={flight.id}>
                                        <td><AppLink href={`/flight/${flight.id}`}>Flight {index + 1}:</AppLink></td>
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
