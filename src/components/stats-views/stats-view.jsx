'use strict';

const React = require('react');
const Altitude = require('../../utils/altitude');
const chartService = require('../../services/chart-service');
const FlightModel = require('../../models/flight');
const PublicLinksMixin = require('../mixins/public-links-mixin');
const SiteModel = require('../../models/site');
const Util = require('../../utils/util');

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

    handleYearSelect(year) {
        if (year) {
            this.setState({ selectedYear: year, flightIds: [] });
        } else {
            this.setState({ selectedYear: null, selectedMonth: null, flightIds: [] });
        }
    },

    handleMonthSelect(monthShort) {
        this.setState({ selectedMonth: monthShort, flightIds: [] });
    },

    handleUnzoom() {
        if (this.state.selectedMonth) {
            this.handleMonthSelect(null);
        } else if (this.state.selectedYear) {
            this.handleYearSelect(null);
        }
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
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleStoreModified } />
            );
        }

        if (this.state.isLoading) {
            return this.renderSimpleLayout(<SectionLoader />);
        }

        const { selectedSiteId, selectedYear } = this.state;
        const selectedMonthIndex = Util.shortMonthNames.indexOf(this.state.selectedMonth) + 1;
        const flightNumberBySitePie = [{
            data: [],
        }];
        const airtimeBySitePie = [{
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

        const siteOptions = SiteModel.getSiteValueTextList();
        const yearOptions = this.state.flightStats.years.map(year => ({ value: year, text: year }));
        const monthOptions = Util.shortMonthNames.map(month => ({ value: month, text: month }));
        const bubbleFlights = this.state.flightIds
            .map(flightId => FlightModel.getItemOutput(flightId))
            .filter(flight => !!flight && !flight.error);

        return (
            <View onStoreModified={ this.handleStoreModified }>
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
