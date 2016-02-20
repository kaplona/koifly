'use strict';

var React = require('react');
var Router = require('react-router');
var History = Router.History;
var Link = Router.Link;
var Util = require('../../utils/util');
var GliderModel = require('../../models/glider');
var View = require('./../common/view');
var TopMenu = require('../common/menu/top-menu');
var BottomMenu = require('../common/menu/bottom-menu');
var BreadCrumbs = require('../common/bread-crumbs');
var Section = require('../common/section/section');
var SectionTitle = require('../common/section/section-title');
var SectionRow = require('../common/section/section-row');
var RowContent = require('../common/section/row-content');
var RemarksRow = require('../common/section/remarks-row');
var Loader = require('../common/loader');
var ErrorBox = require('../common/notice/error-box');


var GliderView = React.createClass({

    propTypes: {
        params: React.PropTypes.shape({
            gliderId: React.PropTypes.string.isRequired
        })
    },

    mixins: [ History ],

    getInitialState: function() {
        return {
            glider: null,
            loadingError: null
        };
    },

    handleToGliderList: function() {
        this.history.pushState(null, '/gliders');
    },

    handleGliderEditing: function() {
        this.history.pushState(null, '/glider/' + this.props.params.gliderId + '/edit');
    },

    handleDataModified: function() {
        var glider = GliderModel.getGliderOutput(this.props.params.gliderId);
        if (glider !== null && glider.error) {
            this.setState({ loadingError: glider.error });
        } else {
            this.setState({
                glider: glider,
                loadingError: null
            });
        }
    },

    renderError: function() {
        return (
            <View onDataModified={ this.handleDataModified } error={ this.state.loadingError }>
                <TopMenu
                    leftText='Back'
                    onLeftClick={ this.handleToGliderList }
                    />
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleDataModified }/>
                <BottomMenu isGliderView={ true } />
            </View>
        );
    },

    renderLoader: function() {
        return (
            <View onDataModified={ this.handleDataModified }>
                <TopMenu
                    leftText='Back'
                    onLeftClick={ this.handleToGliderList }
                    />
                <Loader />
                <BottomMenu isGliderView={ true } />
            </View>
        );
    },

    render: function() {
        if (this.state.loadingError !== null) {
            return this.renderError();
        }

        if (this.state.glider === null) {
            return this.renderLoader();
        }

        return (
            <View onDataModified={ this.handleDataModified }>
                <TopMenu
                    leftText='Back'
                    rightText='Edit'
                    onLeftClick={ this.handleToGliderList }
                    onRightClick={ this.handleGliderEditing }
                    />

                <Section onEditClick={ this.handleGliderEditing } >
                    <BreadCrumbs>
                        <Link to='/gliders'>Gliders</Link>
                        { ' / ' + this.state.glider.name }
                    </BreadCrumbs>

                    <SectionTitle>
                        { this.state.glider.name }
                    </SectionTitle>

                    <SectionRow>
                        <RowContent
                            label='Total flights:'
                            value={ [
                                this.state.glider.trueFlightNum,
                                '( this year:',
                                this.state.glider.flightNumThisYear,
                                ')'
                            ].join(' ') }
                            />
                    </SectionRow>

                    <SectionRow>
                        <RowContent
                            label='Total airtime:'
                            value={ Util.hoursMinutes(this.state.glider.trueAirtime) }
                            />
                    </SectionRow>

                    <SectionTitle isSubtitle={ true }>
                        Usage before Koifly
                    </SectionTitle>

                    <SectionRow>
                        <RowContent
                            label='Flights:'
                            value={ this.state.glider.initialFlightNum }
                            />
                    </SectionRow>

                    <SectionRow>
                        <RowContent
                            label='Airtime:'
                            value={ Util.hoursMinutes(this.state.glider.initialAirtime) }
                            />
                    </SectionRow>

                    <RemarksRow value={ this.state.glider.remarks } />

                </Section>

                <BottomMenu isGliderView={ true } />
            </View>
        );
    }
});



module.exports = GliderView;
