'use strict';

var getWebpackAssets = require('../../tools/get-webpack-assets');
var React = require('react');
var Home = require('../../components/home-page/home.jsx');


var About = React.createClass({

    propTypes: {
        isLoggedIn: React.PropTypes.bool.isRequired
    },

    render: function() {

        return (
            <html>
                <head>
                    <meta charSet='utf-8' />
                    <meta name='viewport' content='width=device-width,initial-scale=1' />
                    <title>Koifly App</title>
                    <link rel='stylesheet' type='text/css' href={ getWebpackAssets().home.css } />
                </head>
                <body>
                    <Home isLoggedIn={ this.props.isLoggedIn } />
                </body>
            </html>
        );
    }
});


module.exports = About;
