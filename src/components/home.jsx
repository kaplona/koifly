'use strict';

var React = require('react');
var TopMenu = require('./common/menu/top-menu');
var BottomMenu = require('./common/menu/bottom-menu');
var Loader = require('./common/loader');


var Home = React.createClass({

    render: function() {
        return (
            <div>
                <TopMenu headerText='Koifly'/>
                <div>Hellow World</div>
                <Loader />
                <BottomMenu />
            </div>
        );
    }
});


module.exports = Home;
