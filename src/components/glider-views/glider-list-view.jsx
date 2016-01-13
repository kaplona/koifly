'use strict';

var React = require('react');
var History = require('react-router').History;
var Util = require('../../utils/util');
var GliderModel = require('../../models/glider');
var View = require('./../common/view');
var TopMenu = require('../common/menu/top-menu');
var BottomMenu = require('../common/menu/bottom-menu');
var Section = require('../common/section/section');
var SectionTitle = require('../common/section/section-title');
var SectionRow = require('../common/section/section-row');
var RowContent = require('../common/section/row-content');
var SimpleButton = require('../common/section/simple-button');
var Loader = require('./../common/loader');
var FirstAdding = require('./../common/first-adding');
var ErrorBox = require('./../common/notice/error-box');


var GliderListView = React.createClass({

    mixins: [ History ],

    getInitialState: function() {
        return {
            gliders: null,
            loadingError: null
        };
    },

    handleGliderAdding: function() {
        this.history.pushState(null, '/glider/0/edit');
    },

    handleGliderEditing: function(gliderId) {
        this.history.pushState(null, '/glider/' + gliderId + '/edit');
    },

    handleDataModified: function() {
        var gliders = GliderModel.getGlidersArray();
        if (gliders !== null && gliders.error) {
            this.setState({ loadingError: gliders.error });
        } else {
            this.setState({
                gliders: gliders,
                loadingError: null
            });
        }
    },

    renderError: function() {
        if (this.state.loadingError !== null) {
            return <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleDataModified }/>;
        }
    },

    renderNoGlidersYet: function() {
        if (this.state.gliders instanceof Array &&
            this.state.gliders.length === 0
        ) {
            return <FirstAdding dataType='gliders' onAdding={ this.handleGliderAdding } />;
        }
    },

    renderGliderNodes: function() {
        if (this.state.gliders === null) {
            return <Loader />;
        }

        var gliderNodes = this.state.gliders.map((glider) => {
            var remarks = glider.remarks ? <SectionRow>{ glider.remarks }</SectionRow> : '';
            return (
                <Section key={ glider.id }>
                    <SectionTitle>{ glider.name }</SectionTitle>

                    <SectionRow>
                        <RowContent
                            label='Flights #:'
                            value={ glider.trueFlightNum }
                            />
                    </SectionRow>

                    <SectionRow>
                        <RowContent
                            label='Total Airtime:'
                            value={ Util.hoursMinutes(glider.trueAirtime) }
                            />
                    </SectionRow>

                    { remarks }

                    <SimpleButton
                        text='Edit'
                        onClick={ () => this.handleGliderEditing(glider.id) }
                        />
                </Section>
            );
        });

        return <div>{ gliderNodes }</div>;
    },

    render: function() {
        var content = this.renderError();

        if (!content) {
            content = this.renderNoGlidersYet();
        }

        if (!content) {
            content = this.renderGliderNodes();
        }

        return (
            <View onDataModified={ this.handleDataModified } error={ this.state.loadingError }>
                <TopMenu
                    headerText='Sites'
                    rightText='+'
                    onRightClick={ this.handleGliderAdding }
                    />
                { content }
                <BottomMenu isGliderView={ true } />
            </View>
        );
    }
});


module.exports = GliderListView;
