'use strict';

const getWebpackAssets = require('../../tools/get-webpack-assets');
const React = require('react');

const Sandbox = React.createClass({

  render: function () {
    return (
      <html>
      <head>
        <meta charSet='utf-8'/>
        <title>Sandbox</title>
        <script src={getWebpackAssets().sandbox.js}></script>
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
});

module.exports = Sandbox;
