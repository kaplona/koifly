'use strict';

var React = require('react');
var History = require('react-router').History;
var GliderModel = require('../../models/glider');
var View = require('./../common/view');
var TopMenu = require('../common/menu/top-menu');
var TopButtons = require('../common/buttons/top-buttons');
var BottomMenu = require('../common/menu/bottom-menu');
var Section = require('../common/section/section');
var Table = require('../common/table');
var Button = require('../common/buttons/button');
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

    handleRowClick: function(gliderId) {
        this.history.pushState(null, '/glider/' + gliderId);
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

    renderLoader: function() {
        return (this.state.gliders === null) ? <Loader /> : '';
    },

    renderNoGlidersYet: function() {
        if (this.state.gliders instanceof Array &&
            this.state.gliders.length === 0
        ) {
            return <FirstAdding dataType='gliders' onAdding={ this.handleGliderAdding } />;
        }
    },

    renderAddGliderButton: function() {
        return <Button text='Add Glider' onClick={ this.handleGliderAdding }/>;
    },

    renderTable: function() {
        var columnsConfig = [
            {
                key: 'name',
                label: 'Name',
                defaultSortingDirection: true
            },
            {
                key: 'trueFlightNum',
                label: 'Flight#',
                defaultSortingDirection: false
            },
            {
                key: 'trueAirtime',
                label: 'Airtime',
                defaultSortingDirection: false
            }
        ];

        return (
            <Table
                columns={ columnsConfig }
                rows={ this.state.gliders }
                initialSortingField='name'
                onRowClick={ this.handleRowClick }
                />
        );
    },

    render: function() {
        var content = this.renderError();

        if (!content) {
            content = this.renderNoGlidersYet();
        }

        if (!content) {
            content = this.renderTable();
        }

        return (
            <View onDataModified={ this.handleDataModified } error={ this.state.loadingError }>
                <Section>
                    <TopMenu
                        headerText='Gliders'
                        rightText='Add'
                        onRightClick={ this.handleGliderAdding }
                        />

                    <TopButtons
                        leftElement={ this.renderAddGliderButton() }
                        />

                    { content }
                    { this.renderLoader() }
                </Section>

                <BottomMenu isGliderView={ true } />
            </View>
        );
    }
});


module.exports = GliderListView;
