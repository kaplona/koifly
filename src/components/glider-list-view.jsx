'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var PubSub = require('../utils/pubsub');
var Util = require('../utils/util');
var GliderModel = require('../models/glider');
var Button = require('./common/button');
var Loader = require('./common/loader');


var GliderListView = React.createClass({

    getInitialState: function() {
        return {
            gliders: null
        };
    },

    componentDidMount: function() {
        PubSub.on('dataModified', this.onDataModified, this);
        this.onDataModified();
    },

    componentWillUnmount: function() {
        PubSub.removeListener('dataModified', this.onDataModified, this);
    },

    onDataModified: function() {
        var gliders = GliderModel.getGlidersArray();
        this.setState({ gliders: gliders });
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
        return (
            <div>
                <Link to='/glider/0/edit'><Button>Add Glider</Button></Link>
                { this.renderGliderNodes() }
            </div>
        );
    }
});


module.exports = GliderListView;



