'use strict';

const React = require('react');
const {shape, string} = React.PropTypes;
const _ = require('lodash');
const editViewMixin = require('../mixins/edit-view-mixin');
const GliderModel = require('../../models/glider');
const MobileTopMenu = require('../common/menu/mobile-top-menu');
const RemarksInput = require('../common/inputs/remarks-input');
const Section = require('../common/section/section');
const SectionRow = require('../common/section/section-row');
const SectionTitle = require('../common/section/section-title');
const TextInput = require('../common/inputs/text-input');
const TimeInput = require('../common/inputs/time-input');
const View = require('../common/view');


const GliderEditView = React.createClass({

  propTypes: {
    params: shape({ // url args
      id: string
    })
  },

  mixins: [editViewMixin(GliderModel.getModelKey())],

  getInitialState: function () {
    return {
      validationErrors: _.clone(GliderEditView.formFields)
    };
  },

  renderMobileTopMenu: function () {
    return (
      <MobileTopMenu
        leftButtonCaption='Cancel'
        rightButtonCaption='Save'
        onLeftClick={this.handleCancelEdit}
        onRightClick={this.handleSubmit}
        isPositionFixed={!this.state.isInputInFocus}
      />
    );
  },

  render: function () {
    if (this.state.loadingError) {
      return this.renderLoadingError();
    }

    if (this.state.item === null) {
      return this.renderLoader();
    }

    return (
      <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
        {this.renderMobileTopMenu()}

        <form>
          {this.renderProcessingError()}

          <Section>
            <SectionTitle>
              Edit Glider
            </SectionTitle>

            <SectionRow>
              <TextInput
                inputValue={this.state.item.name}
                labelText='Name*:'
                inputName='name'
                errorMessage={this.state.validationErrors.name}
                onChange={this.handleInputChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
              />
            </SectionRow>

            <SectionTitle isSubtitle={true}>
              Glider usage before Koifly:
            </SectionTitle>

            <SectionRow>
              <TextInput
                inputValue={this.state.item.initialFlightNum}
                labelText='Number of flights:'
                inputName='initialFlightNum'
                isNumber={true}
                errorMessage={this.state.validationErrors.initialFlightNum}
                onChange={this.handleInputChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
              />
            </SectionRow>

            <SectionRow>
              <TimeInput
                hours={this.state.item.hours}
                minutes={this.state.item.minutes}
                labelText='Airtime:'
                errorMessage={
                  this.state.validationErrors.initialAirtime ||
                  this.state.validationErrors.hours ||
                  this.state.validationErrors.minutes
                }
                onChange={this.handleInputChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
              />
            </SectionRow>

            <SectionRow isLast={true}>
              <RemarksInput
                inputValue={this.state.item.remarks}
                labelText='Remarks'
                errorMessage={this.state.validationErrors.remarks}
                onChange={this.handleInputChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
              />
            </SectionRow>

            {this.renderDesktopButtons()}

          </Section>

          {this.renderMobileButtons()}
        </form>

        {this.renderNavigationMenu()}
      </View>
    );
  }
});


GliderEditView.formFields = {
  name: null,
  initialFlightNum: null,
  initialAirtime: null,
  hours: null,
  minutes: null,
  remarks: null
};


module.exports = GliderEditView;
