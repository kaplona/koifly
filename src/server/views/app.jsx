'use strict';

var config = require('../../config/variables');
var getWebpackAssets = require('../../tools/get-webpack-assets');
var React = require('react');

const TRACKING_CODE_SNIPPET = require('../../constants/tracking-code-snippet');


var App = React.createClass({

    render: function() {

        return (
            <html>
                <head>
                    <meta charSet='utf-8' />
                    <meta name='author' content='Anastasia Kaplina' />
                    <meta name='keywords' content='Koifly,flight log,hang gliding,paragliding' />
                    <meta name='description' content='Keep track of your flights, save your flying spots, make your gliders inventory with Koifly app. Mobile friendly' />
                    <meta name='viewport' content='width=device-width,initial-scale=1,user-scalable=no' />
                    <title>Koifly - Flight logging app for freeflight pilots</title>
                    <script src={ getWebpackAssets().app.js }></script>
                    <script dangerouslySetInnerHTML={ { __html: TRACKING_CODE_SNIPPET } } />
                    <link rel='stylesheet' type='text/css' href={ getWebpackAssets().app.css } />

                    <link rel='icon' type='image/png' sizes='32x32' href='/static/icons/koifly-icon-32x32-round.png' />
                    <link rel='icon' type='image/png' sizes='120x120' href='/static/icons/koifly-icon-120x120.png' />
                    <link rel='icon' type='image/png' sizes='152x152' href='/static/icons/koifly-icon-152x152.png' />
                    <link rel='icon' type='image/png' sizes='192x192' href='/static/icons/koifly-icon-192x192.png' />

                    <link rel='apple-touch-icon-precomposed' sizes='16x16' href='/static/icons/koifly-icon-16x16.png' />
                    <link rel='apple-touch-icon-precomposed' sizes='32x32' href='/static/icons/koifly-icon-32x32.png' />
                    <link rel='apple-touch-icon-precomposed' sizes='48x48' href='/static/icons/koifly-icon-48x48.png' />
                    <link rel='apple-touch-icon-precomposed' sizes='60x60' href='/static/icons/koifly-icon-60x60.png' />
                    <link rel='apple-touch-icon-precomposed' sizes='64x64' href='/static/icons/koifly-icon-64x64.png' />
                    <link rel='apple-touch-icon-precomposed' sizes='76x76' href='/static/icons/koifly-icon-76x76.png' />
                    <link rel='apple-touch-icon-precomposed' sizes='120x120' href='/static/icons/koifly-icon-120x120.png' />
                    <link rel='apple-touch-icon-precomposed' sizes='152x152' href='/static/icons/koifly-icon-152x152.png' />
                    <link rel='apple-touch-icon-precomposed' sizes='167x167' href='/static/icons/koifly-icon-167x167.png' />
                    <link rel='apple-touch-icon-precomposed' sizes='180x180' href='/static/icons/koifly-icon-180x180.png' />

                    <meta name='apple-mobile-web-app-capable' content='yes' />
                    <meta name='apple-mobile-web-app-status-bar-style' content='black' />

                    <meta property='og:title' content='Koifly' />
                    <meta property='og:type' content='application' />
                    <meta property='og:url' content={ `${config.server.rootUrl}/flights` } />
                    <meta property='og:image' content={ `${config.server.rootUrl}/static/icons/koifly-icon.png` } />
                </head>
                <body>
                    <div id='koifly' />
                </body>
            </html>
        );
    }
});

module.exports = App;
