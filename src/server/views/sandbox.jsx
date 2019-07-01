import React from 'react';
import getWebpackAssets from '../../tools/get-webpack-assets';


export default class Sandbox extends React.Component {
  render() {
    return (
      <html>
        <head>
          <meta charSet='utf-8'/>
          <title>Sandbox</title>
          <script src={getWebpackAssets().sandbox.js} />
        </head>

        <body>
          <p>
            This is server/views/sandbox.jsx, a sandbox view. Use it to develop components in a
            fast, clean environment, without loading the rest of your application.
          </p>
          <p>{'UTC time from server: ' + Date.now()}</p>
          <p id='container'>This text will be replaced by your component</p>
        </body>
      </html>
    );
  }
}
