'use strict';

var React = require('react');
var Header = require('./header');
var BottomMenu = require('./common/bottom-menu');


var Koifly = React.createClass({

    render: function() {
        return (
            <div>
                <Header />
                { this.props.children }
                <BottomMenu />
            </div>
        );
    }
});

module.exports = Koifly;
