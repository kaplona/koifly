'use strict';

var React = require('react');
var TopMenu = require('./common/top-menu');
var BottomMenu = require('./common/bottom-menu');


var Home = React.createClass({

    render: function() {
        return (
            <div>
                <TopMenu headerText='Koifly'/>
                <div>Hellow World</div>
                <BottomMenu />
            </div>
        );
    }
});


module.exports = Home;
