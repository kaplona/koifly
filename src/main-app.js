'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

const ReactRouter = require('react-router');
const Router = ReactRouter.Router;
const IndexRoute = ReactRouter.IndexRoute;
const Route = ReactRouter.Route;
const browserHistory = ReactRouter.browserHistory;
const applyRouterMiddleware = ReactRouter.applyRouterMiddleware;
const useScroll = require('react-router-scroll');

const Koifly = require('./components/koifly');

const FlightEditView = require('./components/flight-views/flight-edit-view');
const FlightListView = require('./components/flight-views/flight-list-view');
const FlightView = require('./components/flight-views/flight-view');

const SiteEditView = require('./components/site-views/site-edit-view');
const SiteListMapView = require('./components/site-views/site-list-map-view');
const SiteListView = require('./components/site-views/site-list-view');
const SiteView = require('./components/site-views/site-view');

const GliderEditView = require('./components/glider-views/glider-edit-view');
const GliderListView = require('./components/glider-views/glider-list-view');
const GliderView = require('./components/glider-views/glider-view');

const StatsView = require('./components/stats-views/stats-view');

const PilotFlightsUpload = require('./components/pilot-views/pilot-flights-upload');
const PilotChangePassword = require('./components/pilot-views/pilot-change-password');
const PilotEditView = require('./components/pilot-views/pilot-edit-view');
const PilotView = require('./components/pilot-views/pilot-view');

const Signup = require('./components/public-views/signup');
const Login = require('./components/public-views/login');
const OneTimeLogin = require('./components/public-views/one-time-login');

const InitiateResetPassword = require('./components/public-views/initiate-reset-password');
const ResetPassword = require('./components/public-views/reset-password');

const EmailVerified = require('./components/public-views/email-verified');
const InvalidVerificationLink = require('./components/public-views/invalid-verification-link');

const pageNotFound = require('./components/public-views/page-not-found');


require('./components/koifly.less');


function mainApp() {

  ReactDOM.render((
      <Router
        history={browserHistory}
        render={applyRouterMiddleware(useScroll(() => [0, 0]))} // Scroll to the top on each transition
      >
        <Route path='/'>
          <Route path='app' component={Koifly}>
            <IndexRoute component={FlightListView}/>
            <Route path='/flights' component={FlightListView}/>
            <Route path='/flight/0/edit' component={FlightEditView}/>
            <Route path='/flight/:id/edit' component={FlightEditView}/>
            <Route path='/flight/:id' component={FlightView}/>
            <Route path='/sites/map' component={SiteListMapView}/>
            <Route path='/sites' component={SiteListView}/>
            <Route path='/site/0/edit' component={SiteEditView}/>
            <Route path='/site/:id/edit' component={SiteEditView}/>
            <Route path='/site/:id' component={SiteView}/>
            <Route path='/gliders' component={GliderListView}/>
            <Route path='/glider/0/edit' component={GliderEditView}/>
            <Route path='/glider/:id/edit' component={GliderEditView}/>
            <Route path='/glider/:id' component={GliderView}/>
            <Route path='/stats' component={StatsView}/>
            <Route path='/pilot/edit/change-password' component={PilotChangePassword}/>
            <Route path='/pilot/edit/flights-upload' component={PilotFlightsUpload}/>
            <Route path='/pilot/edit' component={PilotEditView}/>
            <Route path='/pilot' component={PilotView}/>
            <Route path='/signup' component={Signup}/>
            <Route path='/login' component={Login}/>
            <Route path='/one-time-login' component={OneTimeLogin}/>
            <Route path='/reset-password/:pilotId/:authToken' component={ResetPassword}/>
            <Route path='/reset-password' component={InitiateResetPassword}/>
            <Route path='/email-verification/:pilotId/:authToken' component={EmailVerified}/>
            <Route path='/invalid-verification-link' component={InvalidVerificationLink}/>
            <Route path='/*' component={pageNotFound}/>
          </Route>
        </Route>
      </Router>
    ),
    document.getElementById('koifly')
  );
}


document.addEventListener('DOMContentLoaded', mainApp);
