'use strict';

var React = require('react');

var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var IndexRoute = ReactRouter.IndexRoute;
var Route = ReactRouter.Route;
var createBrowserHistory = require('history/lib/createBrowserHistory');

var Koifly = require('./components/koifly');

var FlightEditView = require('./components/flight-views/flight-edit-view');
var FlightListView = require('./components/flight-views/flight-list-view');
var FlightView = require('./components/flight-views/flight-view');

var SiteEditView = require('./components/site-views/site-edit-view');
var SiteListMapView = require('./components/site-views/site-list-map-view');
var SiteListView = require('./components/site-views/site-list-view');
var SiteView = require('./components/site-views/site-view');

var GliderEditView = require('./components/glider-views/glider-edit-view');
var GliderListView = require('./components/glider-views/glider-list-view');
var GliderView = require('./components/glider-views/glider-view');

var PilotChangePassword = require('./components/pilot-views/pilot-change-password');
var PilotEditView = require('./components/pilot-views/pilot-edit-view');
var PilotView = require('./components/pilot-views/pilot-view');

var Signup = require('./components/public-views/signup');
var Login = require('./components/public-views/login');
var OneTimeLogin = require('./components/public-views/one-time-login');

var InitiateResetPassword = require('./components/public-views/initiate-reset-password');
var ResetPassword = require('./components/public-views/reset-password');

var EmailVerified = require('./components/public-views/email-verified');
var InvalidVerificationLink = require('./components/public-views/invalid-verification-link');

var pageNotFound = require('./components/public-views/page-not-found');

//var Test = require('./tests/test');
//var dataService = require('./services/data-service');

require('./components/koifly.less');


function mainApp() {
    //Test.runTests();
    //DataService.initiateStore();

    React.render((
        <Router history={ createBrowserHistory() }>
            <Route path='/'>
                <Route path='app' component={ Koifly }>
                    <IndexRoute component={ FlightListView } />
                    <Route path='/flights' component={ FlightListView } />
                    <Route path='/flight/0/edit' component={ FlightEditView } />
                    <Route path='/flight/:id/edit' component={ FlightEditView } />
                    <Route path='/flight/:id' component={ FlightView } />
                    <Route path='/sites/map' component={ SiteListMapView } />
                    <Route path='/sites' component={ SiteListView } />
                    <Route path='/site/0/edit' component={ SiteEditView } />
                    <Route path='/site/:id/edit' component={ SiteEditView } />
                    <Route path='/site/:id' component={ SiteView } />
                    <Route path='/gliders' component={ GliderListView } />
                    <Route path='/glider/0/edit' component={ GliderEditView } />
                    <Route path='/glider/:id/edit' component={ GliderEditView } />
                    <Route path='/glider/:id' component={ GliderView } />
                    <Route path='/pilot/edit/change-password' component={ PilotChangePassword } />
                    <Route path='/pilot/edit' component={ PilotEditView } />
                    <Route path='/pilot' component={ PilotView } />
                    <Route path='/signup' component={ Signup } />
                    <Route path='/login' component={ Login } />
                    <Route path='/one-time-login' component={ OneTimeLogin } />
                    <Route path='/reset-password/:pilotId/:authToken' component={ ResetPassword } />
                    <Route path='/reset-password' component={ InitiateResetPassword } />
                    <Route path='/email-verification/:pilotId/:authToken' component={ EmailVerified } />
                    <Route path='/invalid-verification-link' component={ InvalidVerificationLink } />
                    <Route path='/*' component={ pageNotFound } />
                </Route>
            </Route>
        </Router>
        ),
        document.getElementById('koifly')
    );
}



document.addEventListener('DOMContentLoaded', mainApp);
