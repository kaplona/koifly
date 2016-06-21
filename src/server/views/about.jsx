'use strict';

var config = require('../../config/variables');
var getWebpackAssets = require('../../tools/get-webpack-assets');
var React = require('react');
var Home = require('../../components/home-page/home.jsx');

const TRACKING_CODE_SNIPPET = require('../../constants/tracking-code-snippet');


var About = React.createClass({

    propTypes: {
        isLoggedIn: React.PropTypes.bool.isRequired
    },

    render: function() {

        return (
            <html>
                <head>
                    <meta charSet='utf-8' />
                    <meta name='author' content='Anastasia Kaplina' />
                    <meta name='keywords' content='Koifly,flight log,hang gliding,paragliding' />
                    <meta name='description' content='Keep track of your flights, save your flying spots, make your gliders inventory with Koifly app. Mobile friendly' />
                    <meta name='viewport' content='width=device-width,initial-scale=1' />
                    <title>Koifly — Flight logging app for freeflight pilots</title>
                    <link rel='stylesheet' type='text/css' href={ getWebpackAssets().home.css } />

                    <link rel='icon' type='image/png' sizes='32x32' href='/static/icons/koifly-icon-32x32-round.png' />

                    <meta property='og:url' content={ config.server.rootUrl } />
                    <meta property='og:type' content='website' />
                    <meta property='og:title' content='Koifly' />
                    <meta property='og:description' content='Keep track of your flights, save your flying spots, make your gliders inventory with Koifly app. Mobile friendly' />
                    <meta property='og:image' content={ `${config.server.rootUrl}/static/icons/koifly-about-icon.jpg` } />
                    <meta property='og:image:width' content='480' />
                    <meta property='og:image:height' content='248' />

                    <script dangerouslySetInnerHTML={ { __html: TRACKING_CODE_SNIPPET } } />
                </head>
                <body>
                    <Home isLoggedIn={ this.props.isLoggedIn } />
                </body>
            </html>
        );
    }
});


module.exports = About;
