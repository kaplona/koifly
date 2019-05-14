'use strict';

const React = require('react');
const { shape, string } = React.PropTypes;
const BreadCrumbs = require('../common/bread-crumbs');
const GliderModel = require('../../models/glider');
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


const GliderView = React.createClass({

    propTypes: {
        params: shape({ // url args
            id: string.isRequired
        })
    },

    mixins: [ itemViewMixin(GliderModel.getModelKey()) ],
    
    renderMobileTopMenu: function() {
        return (
            <MobileTopMenu
                leftButtonCaption='Back'
                rightButtonCaption='Edit'
                onLeftClick={this.handleGoToListView}
                onRightClick={this.handleEditItem}
            />
        );
    },

    render: function() {
        if (this.state.loadingError) {
            return this.renderError();
        }

        if (this.state.item === null) {
            return this.renderLoader();
        }

        let { trueFlightNum } = this.state.item;
        if (this.state.item.flightNumThisYear) {
            trueFlightNum += `, incl. this year: ${this.state.item.flightNumThisYear}`;
        }

        return (
            <View onStoreModified={this.handleStoreModified}>
                {this.renderMobileTopMenu()}
                {this.renderNavigationMenu()}

                <Section onEditClick={this.handleEditItem} >
                    <BreadCrumbs
                        elements={[
                            <Link to='/gliders'>Gliders</Link>,
                            this.state.item.name
                        ]}
                    />

                    <SectionTitle>
                        {this.state.item.name}
                    </SectionTitle>

                    <SectionRow>
                        <RowContent
                            label='Total flights:'
                            value={trueFlightNum}
                        />
                    </SectionRow>

                    <SectionRow>
                        <RowContent
                            label='Total airtime:'
                            value={Util.formatTime(this.state.item.trueAirtime)}
                        />
                    </SectionRow>

                    <SectionTitle isSubtitle={true}>
                        Usage before Koifly
                    </SectionTitle>

                    <SectionRow>
                        <RowContent
                            label='Flights:'
                            value={this.state.item.initialFlightNum}
                        />
                    </SectionRow>

                    <SectionRow>
                        <RowContent
                            label='Airtime:'
                            value={Util.formatTime(this.state.item.initialAirtime)}
                        />
                    </SectionRow>

                    <RemarksRow value={this.state.item.remarks} />

                </Section>
            </View>
        );
    }
});


module.exports = GliderView;
