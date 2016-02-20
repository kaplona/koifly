'use strict';

var React = require('react');

var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var IndexRoute = ReactRouter.IndexRoute;
var Route = ReactRouter.Route;

//var DataService = require('./services/data-service');

var createBrowserHistory = require('history/lib/createBrowserHistory');
//var Home = require('./server-views/home');
var Koifly = require('./components/koifly');
var FlightListView = require('./components/flight-views/flight-list-view');
var FlightView = require('./components/flight-views/flight-view');
var FlightEditView = require('./components/flight-views/flight-edit-view');
var SiteListView = require('./components/site-views/site-list-view');
var SiteListMapView = require('./components/site-views/site-list-map-view');
var SiteView = require('./components/site-views/site-view');
var SiteEditView = require('./components/site-views/site-edit-view');
var GliderListView = require('./components/glider-views/glider-list-view');
var GliderView = require('./components/glider-views/glider-view');
var GliderEditView = require('./components/glider-views/glider-edit-view');
var PilotView = require('./components/pilot-views/pilot-view');
var PilotEditView = require('./components/pilot-views/pilot-edit-view');
var PilotChangePass = require('./components/pilot-views/pilot-change-pass');
var Signup = require('./components/signup');
var Login = require('./components/login');
var OneTimeLogin = require('./components/one-time-login');
var InitiateResetPass = require('./components/initiate-reset-pass');
var ResetPass = require('./components/reset-pass');
var noPage = require('./components/page-not-found');
var EmailVerified = require('./components/verified');
var InvalidToken = require('./components/invalid-token');

//var Test = require('./tests/test');

require('./components/koifly.less');
//require('./components/marketing-page/home.less');


function mainApp() {
    //Test.runTests();
    //DataService.loadData();

    React.render((
        <Router history={ createBrowserHistory() }>
            <Route path='/'>
                <Route path='app' component={ Koifly }>
                    <IndexRoute component={ FlightListView } />
                    <Route path='/flights' component={ FlightListView } />
                    <Route path='/flight/0/edit' component={ FlightEditView } />
                    <Route path='/flight/:flightId/edit' component={ FlightEditView } />
                    <Route path='/flight/:flightId' component={ FlightView } />
                    <Route path='/sites/map' component={ SiteListMapView } />
                    <Route path='/sites' component={ SiteListView } />
                    <Route path='/site/0/edit' component={ SiteEditView } />
                    <Route path='/site/:siteId/edit' component={ SiteEditView } />
                    <Route path='/site/:siteId' component={ SiteView } />
                    <Route path='/gliders' component={ GliderListView } />
                    <Route path='/glider/0/edit' component={ GliderEditView } />
                    <Route path='/glider/:gliderId/edit' component={ GliderEditView } />
                    <Route path='/glider/:gliderId' component={ GliderView } />
                    <Route path='/pilot/edit/change-pass' component={ PilotChangePass } />
                    <Route path='/pilot/edit' component={ PilotEditView } />
                    <Route path='/pilot' component={ PilotView } />
                    <Route path='/signup' component={ Signup } />
                    <Route path='/login' component={ Login } />
                    <Route path='/one-time-login' component={ OneTimeLogin } />
                    <Route path='/reset-pass/:pilotId/:token' component={ ResetPass } />
                    <Route path='/reset-pass' component={ InitiateResetPass } />
                    <Route path='/email/:pilotId/:token' component={ EmailVerified } />
                    <Route path='/invalid-token' component={ InvalidToken } />
                    <Route path='/*' component={ noPage } />
                </Route>
            </Route>
        </Router>
        ),
        document.getElementById('koifly')
    );
}



document.addEventListener('DOMContentLoaded', mainApp);
