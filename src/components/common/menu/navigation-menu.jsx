'use strict';

var React = require('react');
var History = require('react-router').History;

var FlightModel = require('../../../models/flight');
var GliderModel = require('../../../models/glider');
var SiteModel = require('../../../models/site');
var PilotModel = require('../../../models/pilot');

var NavigationItem = require('./navigation-item');

require('./navigation-menu.less');



var { bool, string } = React.PropTypes;

var NavigationMenu = React.createClass({

    propTypes: {
        currentView: string,
        isMobile: bool.isRequired
    },

    getDefaultProps: function() {
        return {
            isMobile: false
        };
    },

    mixins: [ History ],

    handleLinkTo: function(page) {
        this.history.pushState(null, `/${encodeURIComponent(page)}`);
    },

    render: function() {
        var itemsNumber = 4;

        return (
            <div className={ 'navigation-menu' + (this.props.isMobile ? ' x-mobile' : '') }>
                <NavigationItem
                    iconFileName='log-book.png'
                    label='Flights'
                    itemsNumber={ itemsNumber }
                    isActive={ this.props.currentView === FlightModel.getModelKey() }
                    onClick={ () => this.handleLinkTo('flights') }
                    />
                <NavigationItem
                    iconFileName='mountains.png'
                    label='Sites'
                    itemsNumber={ itemsNumber }
                    isActive={ this.props.currentView === SiteModel.getModelKey() }
                    onClick={ () => this.handleLinkTo('sites') }
                    />
                <NavigationItem
                    iconFileName='glider.png'
                    label='Gliders'
                    itemsNumber={ itemsNumber }
                    isActive={ this.props.currentView === GliderModel.getModelKey() }
                    onClick={ () => this.handleLinkTo('gliders') }
                    />
                <NavigationItem
                    iconFileName='person.png'
                    label='Pilot'
                    itemsNumber={ itemsNumber }
                    isActive={ this.props.currentView === PilotModel.getModelKey() }
                    onClick={ () => this.handleLinkTo('pilot') }
                    />
            </div>
        );
    }
});

module.exports = NavigationMenu;
