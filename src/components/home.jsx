'use strict';

var React = require('react');
var Loader = require('./common/loader');


var Home = React.createClass({

    render: function() {
        return (
            <div>
                <Loader />
                <div>Hellow World</div>
            </div>
        );
    }
});


module.exports = Home;
