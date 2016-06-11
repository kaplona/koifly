# Flight Logging App for Freeflight Pilots

This app is designed for hang gliding and paragliding pilots who want to keep records of their flights.

#### [koifly.com](https://www.koifly.com) - Live app


## Features

* Keep a log of your flights
* Store information about your flying spots (sites)
* See a nice map view of your sites
* Check pilot statistics: your number of flights, total airtime and more
* Access from anywhere, on any smartphone or computer


## Coming Soon

* Data export/import
* GPS uploading
* More fields, more statistics
* Offline app


## Tech Stack

* Node.js, Hapi.js, Webpack, Babel, React, React-router
* Mocha, Chai, Sinon, jsDOM test setup

#### Hosting your own Koifly

* `git clone` this project
* `npm install` to download dependencies
* `cp -i src/secrets-sample.js src/secrets.js`, then add your database credentials etc. to this file.
* Create MySQL database, then run `npm run init_db` to create DB tables (note: this requires all previous steps to be done)

Run in Development Mode:
* `npm run dev` to start Hapi application server
* `npm run webpack` in another terminal session to start webpack dev server
* Keep these terminal sessions open while developing. Hot Module Reloading will pick up your code changes and reload your app.
* You might need to manually restart the webpack process if you make changes to webpack configuration.

Simple Production Setup:
* `npm install -g forever` (once)
* `npm run build` to generate frontend asset bundles (whenever you push new frontend code)
* `npm run forever_start` to start up application server



## Author

Anastasia Kaplina

[nkaplina@gmail.com](mailto:nkaplina@gmail.com)


### License

[MIT](https://github.com/kaplona/koifly/blob/master/LICENSE.md)