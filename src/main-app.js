'use strict';

var React = require('react');

var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var IndexRoute = ReactRouter.IndexRoute;
var Route = ReactRouter.Route;

var DataService = require('./services/data-service');

var createBrowserHistory = require('history/lib/createBrowserHistory');
var Home = require('./components/home');
var Koifly = require('./components/koifly');
var FlightListView = require('./components/flight-list-view');
var FlightView = require('./components/flight-view');
var FlightEditView = require('./components/flight-edit-view');
var SiteListView = require('./components/site-list-view');
var SiteListMapView = require('./components/site-list-map-view');
var SiteView = require('./components/site-view');
var SiteEditView = require('./components/site-edit-view');
var GliderListView = require('./components/glider-list-view');
var GliderEditView = require('./components/glider-edit-view');
var PilotView = require('./components/pilot-view');
var PilotEditView = require('./components/pilot-edit-view');
var noPage = require('./components/page-not-found');

//var Test = require('./tests/test');

require('./components/koifly.css');


function mainApp() {
    //Test.runTests();
    DataService.loadData();

    React.render((
        <Router history={ createBrowserHistory() }>
            <Route path='/' component={ Koifly }>
                <IndexRoute component={ Home } />
                <Route path='flights' component={ FlightListView } />
                <Route path='flight/0/edit' component={ FlightEditView } />
                <Route path='flight/:flightId/edit' component={ FlightEditView } />
                <Route path='flight/:flightId' component={ FlightView } />
                <Route path='sites/map' component={ SiteListMapView } />
                <Route path='sites' component={ SiteListView } />
                <Route path='site/0/edit' component={ SiteEditView } />
                <Route path='site/:siteId/edit' component={ SiteEditView } />
                <Route path='site/:siteId' component={ SiteView } />
                <Route path='gliders' component={ GliderListView } />
                <Route path='glider/0/edit' component={ GliderEditView } />
                <Route path='glider/:gliderId/edit' component={ GliderEditView } />
                <Route path='pilot/edit' component={ PilotEditView } />
                <Route path='pilot' component={ PilotView } />
                <Route path='*' component={ noPage }/>
            </Route>
        </Router>
        ),
        document.getElementById('app')
    );
}



document.addEventListener('DOMContentLoaded', mainApp);




