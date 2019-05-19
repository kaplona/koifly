'use strict';

const React = require('react');
const {shape, string} = React.PropTypes;
const Altitude = require('../../utils/altitude');
const BreadCrumbs = require('../common/bread-crumbs');
const itemViewMixin = require('../mixins/item-view-mixin');
const Link = require('react-router').Link;
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const RemarksRow = require('../common/section/remarks-row');
const RowContent = require('../common/section/row-content');
const Section = require('../common/section/section');
const SectionRow = require('../common/section/section-row');
const SectionTitle = require('../common/section/section-title');
const SiteModel = require('../../models/site');
const StaticMap = require('../common/maps/static-map');
const Util = require('../../utils/util');
const View = require('../common/view');
const ZOOM_LEVEL = require('../../constants/map-constants').ZOOM_LEVEL;


const SiteView = React.createClass({

  propTypes: {
    params: shape({ // url args
      id: string.isRequired
    })
  },

  mixins: [itemViewMixin(SiteModel.getModelKey())],

  renderMobileTopMenu: function () {
    return (
      <MobileTopMenu
        leftButtonCaption='Back'
        rightButtonCaption='Edit'
        onLeftClick={this.handleGoToListView}
        onRightClick={this.handleEditItem}
      />
    );
  },

  renderMap: function () {
    if (this.state.item.coordinates) {
      return StaticMap.create({
        center: SiteModel.getLatLng(this.state.item.id),
        zoomLevel: ZOOM_LEVEL.site,
        sites: [this.state.item]
      });
    }
  },

  render: function () {
    if (this.state.loadingError) {
      return this.renderError();
    }

    if (this.state.item === null) {
      return this.renderLoader();
    }

    let {flightNum} = this.state.item;
    if (this.state.item.flightNumThisYear) {
      flightNum += `, incl. this year: ${this.state.item.flightNumThisYear}`;
    }

    return (
      <View onStoreModified={this.handleStoreModified}>
        {this.renderMobileTopMenu()}
        {this.renderNavigationMenu()}

        <Section onEditClick={this.handleEditItem}>
          <BreadCrumbs
            elements={[
              <Link to='/sites'>Sites</Link>,
              this.state.item.name
            ]}
          />

          <SectionTitle>
            {this.state.item.name}
          </SectionTitle>

          <SectionRow>
            <RowContent
              label='Location:'
              value={Util.formatText(this.state.item.location)}
            />
          </SectionRow>

          <SectionRow>
            <RowContent
              label='Launch altitude:'
              value={Altitude.formatAltitude(this.state.item.launchAltitude)}
            />
          </SectionRow>

          <SectionRow>
            <RowContent
              label='Coordinates:'
              value={this.state.item.coordinates ? this.state.item.coordinates : '—'}
            />
          </SectionRow>

          <SectionRow>
            <RowContent
              label='Flights:'
              value={flightNum}
            />
          </SectionRow>

          <RemarksRow value={this.state.item.remarks}/>

          {this.renderMap()}
        </Section>
      </View>
    );
  }
});


module.exports = SiteView;
