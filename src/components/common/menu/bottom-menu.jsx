'use strict';

var React = require('react');
var History = require('react-router').History;
var NavigationItem = require('./navigation-item');

require('./menu.less');


var BottomMenu = React.createClass({

    propTypes: {
        isFlightView: React.PropTypes.bool,
        isSiteView: React.PropTypes.bool,
        isGliderView: React.PropTypes.bool,
        isPilotView: React.PropTypes.bool
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
            <div className='bottom-menu'>
                <NavigationItem
                    itemsNumber={ itemsNumber }
                    isActive={ this.props.isFlightView }
                    onClick={ () => this.handleLinkTo('/flights') }
                    >
                    F
                </NavigationItem>
                <NavigationItem
                    itemsNumber={ itemsNumber }
                    isActive={ this.props.isSiteView }
                    onClick={ () => this.handleLinkTo('/sites') }
                    >
                    S
                </NavigationItem>
                <NavigationItem
                    itemsNumber={ itemsNumber }
                    isActive={ this.props.isGliderView }
                    onClick={ () => this.handleLinkTo('/gliders') }
                    >
                    G
                </NavigationItem>
                <NavigationItem
                    itemsNumber={ itemsNumber }
                    isActive={ this.props.isPilotView }
                    onClick={ () => this.handleLinkTo('/pilot') }
                    >
                    P
                </NavigationItem>
            </div>
        );
    }
});

module.exports = BottomMenu;
