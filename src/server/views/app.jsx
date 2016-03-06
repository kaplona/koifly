'use strict';

var getWebpackAssets = require('../../tools/get-webpack-assets');
var React = require('react');


var App = React.createClass({

    render: function() {

        return (
            <html>
                <head>
                    <meta charSet='utf-8' />
                    <meta name='viewport' content='width=device-width,initial-scale=1,user-scalable=no' />
                    <title>Koifly App</title>
                    <script src={ getWebpackAssets().app.js }></script>
                    <link rel='stylesheet' type='text/css' href={ getWebpackAssets().app.css } />
                </head>
                <body>
                    <div id='koifly' />
                </body>
            </html>
        );
    }
});

module.exports = App;
