'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var Link = ReactRouter.Link;
var Util = require('../utils/util');
var GliderModel = require('../models/glider');
var View = require('./common/view');
var Button = require('./common/button');
var Loader = require('./common/loader');
var FirstAdding = require('./common/first-adding');


var GliderListView = React.createClass({

    mixins: [ History ],

    getInitialState: function() {
        return {
            gliders: null
        };
    },

    handleGliderAdding: function() {
        this.history.pushState(null, '/glider/0/edit');
    },

    onDataModified: function() {
        var gliders = GliderModel.getGlidersArray();
        this.setState({ gliders: gliders });
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
        if (this.state.gliders instanceof Array &&
            this.state.gliders.length === 0
        ) {
            return this.renderNoGlidersYet();
        }

        return (
            <View onDataModified={ this.onDataModified }>
                <Link to='/glider/0/edit'><Button>Add Glider</Button></Link>
                { this.renderGliderNodes() }
            </View>
        );
    }
});


module.exports = GliderListView;
