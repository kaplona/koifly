'use strict';

var React = require('react');
var Link = require('react-router').Link;

var itemViewMixin = require('../mixins/item-view-mixin');
var GliderModel = require('../../models/glider');
var Util = require('../../utils/util');

var BreadCrumbs = require('../common/bread-crumbs');
var MobileTopMenu = require('../common/menu/mobile-top-menu');
var RemarksRow = require('../common/section/remarks-row');
var RowContent = require('../common/section/row-content');
var Section = require('../common/section/section');
var SectionRow = require('../common/section/section-row');
var SectionTitle = require('../common/section/section-title');
var View = require('../common/view');



var { shape, string } = React.PropTypes;

var GliderView = React.createClass({

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
                onLeftClick={ this.handleToListView }
                onRightClick={ this.handleEditItem }
                />
        );
    },

    render: function() {
        if (this.state.loadingError !== null) {
            return this.renderError();
        }

        if (this.state.item === null) {
            return this.renderLoader();
        }

        var { trueFlightNum, flightNumThisYear } = this.state.item;

        return (
            <View onStoreModified={ this.handleStoreModified }>
                { this.renderMobileTopMenu() }
                { this.renderNavigationMenu() }

                <Section onEditClick={ this.handleEditItem } >
                    <BreadCrumbs
                        elements={ [
                            <Link to='/gliders'>Gliders</Link>,
                            this.state.item.name
                        ] }
                        />

                    <SectionTitle>
                        { this.state.item.name }
                    </SectionTitle>

                    <SectionRow>
                        <RowContent
                            label='Total flights:'
                            value={ `${trueFlightNum} ( this year: ${flightNumThisYear} )` }
                            />
                    </SectionRow>

                    <SectionRow>
                        <RowContent
                            label='Total airtime:'
                            value={ Util.hoursMinutes(this.state.item.trueAirtime) }
                            />
                    </SectionRow>

                    <SectionTitle isSubtitle={ true }>
                        Usage before Koifly
                    </SectionTitle>

                    <SectionRow>
                        <RowContent
                            label='Flights:'
                            value={ this.state.item.initialFlightNum }
                            />
                    </SectionRow>

                    <SectionRow>
                        <RowContent
                            label='Airtime:'
                            value={ Util.hoursMinutes(this.state.item.initialAirtime) }
                            />
                    </SectionRow>

                    <RemarksRow value={ this.state.item.remarks } />

                </Section>
            </View>
        );
    }
});



module.exports = GliderView;
