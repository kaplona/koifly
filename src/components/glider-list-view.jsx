'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var History = ReactRouter.History;
var Util = require('../utils/util');
var GliderModel = require('../models/glider');
var View = require('./common/view');
var Button = require('./common/button');
var Loader = require('./common/loader');
var FirstAdding = require('./common/first-adding');
var ErrorBox = require('./common/error-box');


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

    onDataModified: function() {
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
        return (
            <View onDataModified={ this.onDataModified }>
                <ErrorBox error={ this.state.loadingError } onTryAgain={ this.onDataModified }/>
            </View>
        );
    },

    renderNoGlidersYet: function() {
        return (
            <View onDataModified={ this.onDataModified }>
                <FirstAdding
                    dataType='gliders'
                    onAdding={ this.handleGliderAdding }
                    />
            </View>
        );
    },

    renderGliderNodes: function() {
        if (this.state.gliders === null) {
            return <Loader />;
        }

        var gliderNodes = this.state.gliders.map((glider) => {
            return (
                <div key={ glider.id }>
                    <div className='container__title'>
                        { glider.name }
                    </div>
                    <div className='container__subtitle'>
                        <div>Flights #: { glider.trueFlightNum }</div>
                        <div>Total Airtime: { Util.hoursMinutes(glider.trueAirtime) }</div>
                    </div>
                    <div>{ glider.remarks }</div>
                    <Link to={ '/glider/' + glider.id + '/edit' }><Button>Edit</Button></Link>
                </div>
            );
        });

        return <div>{ gliderNodes }</div>;
    },

    render: function() {
        if (this.state.loadingError !== null) {
            return this.renderError();
        }

        if (this.state.gliders instanceof Array &&
            this.state.gliders.length === 0
        ) {
            return this.renderNoGlidersYet();
        }

        return (
            <View onDataModified={ this.onDataModified }>
                <Button onClick={ this.handleGliderAdding }>Add Glider</Button>
                { this.renderGliderNodes() }
            </View>
        );
    }
});


module.exports = GliderListView;
