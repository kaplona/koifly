import React from 'react';
import config from '../../config/variables';
import getWebpackAssets from '../../tools/get-webpack-assets';
import trackingCodeSnippet from '../../constants/tracking-code-snippet';


export default class App extends React.Component {
  render() {
    return (
      <html>
        <head>
          <meta charSet='utf-8'/>
          <meta name='author' content='Anastasia Kaplina'/>
          <meta name='keywords' content='Koifly,flight log,hang gliding,paragliding'/>
          <meta name='description' content='Keep track of your flights, save your flying spots, make your gliders inventory with Koifly app. Mobile friendly'/>
          <meta name='viewport' content='width=device-width,initial-scale=1,user-scalable=no'/>

          <title>Koifly — Flight logging app for freeflight pilots</title>

          <script src={getWebpackAssets().app.js} />
          <script dangerouslySetInnerHTML={{ __html: trackingCodeSnippet }}/>

          <link rel='stylesheet' type='text/css' href={getWebpackAssets().app.css}/>

          <link rel='icon' type='image/png' sizes='32x32' href='/static/icons/koifly-icon-32x32-round.png'/>
          <link rel='icon' type='image/png' sizes='120x120' href='/static/icons/koifly-icon-120x120.png'/>
          <link rel='icon' type='image/png' sizes='152x152' href='/static/icons/koifly-icon-152x152.png'/>
          <link rel='icon' type='image/png' sizes='192x192' href='/static/icons/koifly-icon-192x192.png'/>

          <link rel='apple-touch-icon-precomposed' sizes='16x16' href='/static/icons/koifly-icon-16x16.png'/>
          <link rel='apple-touch-icon-precomposed' sizes='32x32' href='/static/icons/koifly-icon-32x32.png'/>
          <link rel='apple-touch-icon-precomposed' sizes='48x48' href='/static/icons/koifly-icon-48x48.png'/>
          <link rel='apple-touch-icon-precomposed' sizes='60x60' href='/static/icons/koifly-icon-60x60.png'/>
          <link rel='apple-touch-icon-precomposed' sizes='64x64' href='/static/icons/koifly-icon-64x64.png'/>
          <link rel='apple-touch-icon-precomposed' sizes='76x76' href='/static/icons/koifly-icon-76x76.png'/>
          <link rel='apple-touch-icon-precomposed' sizes='120x120' href='/static/icons/koifly-icon-120x120.png'/>
          <link rel='apple-touch-icon-precomposed' sizes='152x152' href='/static/icons/koifly-icon-152x152.png'/>
          <link rel='apple-touch-icon-precomposed' sizes='167x167' href='/static/icons/koifly-icon-167x167.png'/>
          <link rel='apple-touch-icon-precomposed' sizes='180x180' href='/static/icons/koifly-icon-180x180.png'/>

          {/* Sets whether a web application runs in full-screen mode */}
          <meta name='apple-mobile-web-app-capable' content='yes'/>
          <meta name='mobile-web-app-capable' content='yes'/>
          {/* Set header bar and search bar color to app header and menu color */}
          <meta name='apple-mobile-web-app-status-bar-style' content='black'/>
          <meta name='theme-color' content='#1F95C7'/>

          <meta property='og:url' content={`${config.server.rootUrl}/flights`}/>
          <meta property='og:type' content='website'/>
          <meta property='og:title' content='Koifly'/>
          <meta property='og:description' content='Keep track of your flights, save your flying spots, make your gliders inventory with Koifly app. Mobile friendly'/>
          <meta property='og:image' content={`${config.server.rootUrl}/static/icons/koifly-icon.png`}/>
        </head>

        <body>
          <div id='koifly'/>
        </body>
      </html>
    );
  }
}
