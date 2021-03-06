import React from 'react';
import { bool } from 'prop-types';
import config from '../../config/variables';
import getWebpackAssets from '../../tools/get-webpack-assets';
import Home from '../../components/home-page/home.jsx';
import trackingCodeSnippet from '../../constants/tracking-code-snippet';


export default class About extends React.Component {
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

          <link rel='stylesheet' type='text/css' href={getWebpackAssets().home.css}/>
          <link rel='icon' type='image/png' sizes='32x32' href='/static/icons/koifly-icon-32x32-round.png'/>

          <meta property='og:url' content={config.server.rootUrl}/>
          <meta property='og:type' content='website'/>
          <meta property='og:title' content='Koifly'/>
          <meta property='og:description' content='Keep track of your flights, save your flying spots, make your gliders inventory with Koifly app. Mobile friendly'/>
          <meta property='og:image' content={`${config.server.rootUrl}/static/icons/koifly-about-icon.jpg`}/>
          <meta property='og:image:width' content='480'/>
          <meta property='og:image:height' content='248'/>

          {trackingCodeSnippet &&
            <script dangerouslySetInnerHTML={{ __html: trackingCodeSnippet }}/>
          }
        </head>

        <body>
          <Home isLoggedIn={this.props.isLoggedIn}/>
        </body>
      </html>
    );
  }
}


About.propTypes = {
  isLoggedIn: bool.isRequired
};
