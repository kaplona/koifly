'use strict';

var React = require('react');
var History = require('react-router').History;
var NavigationItem = require('./navigation-item');

require('./bottom-menu.less');


var BottomMenu = React.createClass({

    propTypes: {
        isFlightView: React.PropTypes.bool,
        isSiteView: React.PropTypes.bool,
        isGliderView: React.PropTypes.bool,
        isPilotView: React.PropTypes.bool,
        isMobile: React.PropTypes.bool
    },

    getDefaultProps: function() {
        return {
            isFlightView: false,
            isSiteView: false,
            isGliderView: false,
            isPilotView: false
        };
    },

    mixins: [ History ],

    handleLinkTo: function(link) {
        this.history.pushState(null, link);
    },

    render: function() {
        var itemsNumber = 4;

        return (
            <div className={ 'bottom-menu' + (this.props.isMobile ? ' x-mobile' : '') }>
                <NavigationItem
                    iconFileName='log-book.png'
                    text='Flights'
                    itemsNumber={ itemsNumber }
                    isActive={ this.props.isFlightView }
                    onClick={ () => this.handleLinkTo('/flights') }
                    />
                <NavigationItem
                    iconFileName='mountains.png'
                    text='Sites'
                    itemsNumber={ itemsNumber }
                    isActive={ this.props.isSiteView }
                    onClick={ () => this.handleLinkTo('/sites') }
                    />
                <NavigationItem
                    iconFileName='glider.png'
                    text='Gliders'
                    itemsNumber={ itemsNumber }
                    isActive={ this.props.isGliderView }
                    onClick={ () => this.handleLinkTo('/gliders') }
                    />
                <NavigationItem
                    iconFileName='person.png'
                    text='Pilot'
                    itemsNumber={ itemsNumber }
                    isActive={ this.props.isPilotView }
                    onClick={ () => this.handleLinkTo('/pilot') }
                    />
            </div>
        );
    }
});

module.exports = BottomMenu;
