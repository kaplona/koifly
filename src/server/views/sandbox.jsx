import React from 'react';
import getWebpackAssets from '../../tools/get-webpack-assets';


export default class Sandbox extends React.Component {
  render() {
    return (
      <html>
        <head>
          <meta charSet='utf-8'/>
          <title>Sandbox</title>
          <script src={getWebpackAssets().runtime.js} />
          <script src={getWebpackAssets().vendors.js} />
          <script src={getWebpackAssets().sandbox.js} />
          <link rel='stylesheet' type='text/css' href={getWebpackAssets().sandbox.css} />
        </head>

        <body>
          <p>
            This is server/views/sandbox.jsx, a sandbox view. Use it to develop components in a
            fast, clean environment, without loading the rest of your application.
          </p>
          <p>{'UTC time from server: ' + Date.now()}</p>
          <div id='container'>This text will be replaced by your component</div>
        </body>
      </html>
    );
  }
}
