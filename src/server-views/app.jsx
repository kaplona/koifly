'use strict';

var getWebpackAssets = require('../tools/get-webpack-assets');
var React = require('react');

var App = React.createClass({

    render: function() {
        return (
            <html>
                <head>
                    <meta charSet='utf-8' />
                    <title>Koifly App</title>
                    <script src='https://maps.googleapis.com/maps/api/js?v=3&key=AIzaSyBz1tSd7GuxPzuUdHxOIA6nDWODomNAE3s'></script>
                    <script src={ getWebpackAssets().app.js }></script>
                </head>
                <body>
                    <div id='app' />
                </body>
            </html>
        );
    }
});

module.exports = App;
