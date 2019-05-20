'use strict';

const React = require('react');
const { shape, string } = React.PropTypes;
const Altitude = require('../../utils/altitude');
const BreadCrumbs = require('../common/bread-crumbs');
const FightMapAndCharts = require('./flight-map-and-charts');
const FlightModel = require('../../models/flight');
const itemViewMixin = require('../mixins/item-view-mixin');
const Link = require('react-router').Link;
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const RemarksRow = require('../common/section/remarks-row');
const RowContent = require('../common/section/row-content');
const Section = require('../common/section/section');
const SectionRow = require('../common/section/section-row');
const SectionTitle = require('../common/section/section-title');
const Util = require('../../utils/util');
const View = require('../common/view');

const FlightView = React.createClass({

  propTypes: {
    params: shape({ // url args
      id: string.isRequired
    }).isRequired
  },

  mixins: [ itemViewMixin(FlightModel.getModelKey()) ],

  renderMobileTopMenu() {
    return (
      <MobileTopMenu
        leftButtonCaption='Back'
        rightButtonCaption='Edit'
        onLeftClick={this.handleGoToListView}
        onRightClick={this.handleEditItem}
      />
    );
  },

  render() {
    if (this.state.loadingError) {
      return this.renderError();
    }

    if (this.state.item === null) {
      return this.renderLoader();
    }

    const { date, flightNumDay, numOfFlightsThatDay } = this.state.item;
    const flightName = `${date} (${flightNumDay}/${numOfFlightsThatDay})`;

    return (
      <View onStoreModified={this.handleStoreModified}>
        {this.renderMobileTopMenu()}
        {this.renderNavigationMenu()}

        <Section onEditClick={this.handleEditItem}>
          <BreadCrumbs
            elements={[
              <Link to='/flights'>Flights</Link>,
              flightName
            ]}
          />

          <SectionTitle>
            <div>{Util.formatDate(this.state.item.date)}</div>
            <div>{this.state.item.siteName}</div>
          </SectionTitle>

          <SectionRow>
            <RowContent
              label='Flight number:'
              value={[
                Util.addOrdinalSuffix(this.state.item.flightNum),
                ', in ',
                Util.getDateYear(date).toString(),
                ': ',
                Util.addOrdinalSuffix(this.state.item.flightNumYear)
              ].join('')}
            />
          </SectionRow>

          <SectionRow>
            <RowContent
              label='Max altitude:'
              value={Altitude.formatAltitude(this.state.item.altitude)}
            />
          </SectionRow>

          <SectionRow>
            <RowContent
              label='Above launch:'
              value={Altitude.formatAltitude(this.state.item.altitudeAboveLaunch)}
            />
          </SectionRow>

          <SectionRow>
            <RowContent
              label='Airtime:'
              value={Util.formatTime(this.state.item.airtime)}
            />
          </SectionRow>

          <SectionRow>
            <RowContent
              label='Glider:'
              value={Util.formatText(this.state.item.gliderName)}
            />
          </SectionRow>

          <RemarksRow value={this.state.item.remarks}/>

          <FightMapAndCharts
            igc={this.state.item.igc}
            siteId={this.state.item.siteId}
          />
        </Section>
      </View>
    );
  }
});


module.exports = FlightView;
