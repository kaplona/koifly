# Flight Logging App for Freeflight Pilots

This app is designed for hang gliding and paragliding pilots who want to keep records of their flights.

#### [koifly.com](https://www.koifly.com) - Live app


## Features

* Keep a log of your flights
* Store information about your flying spots (sites) and gliders
* See your flights and sites on the map
* Analyze your progress with app statistics
* Access from anywhere, on any device


## Coming Soon

* Flight tagging and advanced search
* More fields, more statistics
* Data export
* Offline app


## Tech Stack

* Node, Hapi, Webpack, Babel, React, React Router
* test setup: Testing Library, Mocha, Chai, Sinon, jsDOM

#### Hosting your own Koifly

* `git clone` this project
* `npm install` to download dependencies
* `cp -i src/secrets-sample.js src/secrets.js`, then add your database credentials and other app setting to this file.
* `cp -i src/frontend-assets-sample.js src/frontend-assets.js`, then add your server side API keys and other configuration.
* Create MySQL database, then run `npm run db_migrate` to create DB tables (note: this requires all previous steps to be done)

Run in Development Mode:
* `npm run dev` to start Hapi application server
* `npm run webpack` in another terminal session to start webpack dev server
* Keep these terminal sessions open while developing. Hot Module Reloading will pick up your code changes and reload your app.
* You need to restart the webpack process if you make changes to the webpack configuration.

Simple Production Setup:
* `npm install -g forever` globally
* `npm run build` to generate frontend bundles
* `npm run forever_start` to start the application server



## Author

Anastasia Kaplina

[nkaplina@gmail.com](mailto:nkaplina@gmail.com)


### License

[MIT](https://github.com/kaplona/koifly/blob/master/LICENSE.md)
