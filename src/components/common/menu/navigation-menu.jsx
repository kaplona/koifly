'use strict';

var React = require('react');
var History = require('react-router').History;
var NavigationItem = require('./navigation-item');

require('./navigation-menu.less');


var NavigationMenu = React.createClass({

    propTypes: {
        isFlightView: React.PropTypes.bool.isRequired,
        isSiteView: React.PropTypes.bool.isRequired,
        isGliderView: React.PropTypes.bool.isRequired,
        isPilotView: React.PropTypes.bool.isRequired,
        isMobile: React.PropTypes.bool.isRequired
    },

    getDefaultProps: function() {
        return {
            isFlightView: false,
            isSiteView: false,
            isGliderView: false,
            isPilotView: false,
            isMobile: false
        };
    },

    mixins: [ History ],

    handleLinkTo: function(link) {
        this.history.pushState(null, link);
    },

    render: function() {
        var itemsNumber = 4;

        return (
            <div className={ 'navigation-menu' + (this.props.isMobile ? ' x-mobile' : '') }>
                <NavigationItem
                    iconFileName='log-book.png'
                    label='Flights'
                    itemsNumber={ itemsNumber }
                    isActive={ this.props.isFlightView }
                    onClick={ () => this.handleLinkTo('/flights') }
                    />
                <NavigationItem
                    iconFileName='mountains.png'
                    label='Sites'
                    itemsNumber={ itemsNumber }
                    isActive={ this.props.isSiteView }
                    onClick={ () => this.handleLinkTo('/sites') }
                    />
                <NavigationItem
                    iconFileName='glider.png'
                    label='Gliders'
                    itemsNumber={ itemsNumber }
                    isActive={ this.props.isGliderView }
                    onClick={ () => this.handleLinkTo('/gliders') }
                    />
                <NavigationItem
                    iconFileName='person.png'
                    label='Pilot'
                    itemsNumber={ itemsNumber }
                    isActive={ this.props.isPilotView }
                    onClick={ () => this.handleLinkTo('/pilot') }
                    />
            </div>
        );
    }
});

module.exports = NavigationMenu;
