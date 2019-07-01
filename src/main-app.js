import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import browserHistory from './services/browser-history';
import ScrollToTop from './components/common/scroll-to-top';

import Koifly from './components/koifly';
import FlightEditView from './components/flight-views/flight-edit-view';
import FlightListView from './components/flight-views/flight-list-view';
import FlightView from './components/flight-views/flight-view';
import SiteEditView from './components/site-views/site-edit-view';
import SiteListMapView from './components/site-views/site-list-map-view';
import SiteListView from './components/site-views/site-list-view';
import SiteView from './components/site-views/site-view';
import GliderEditView from './components/glider-views/glider-edit-view';
import GliderListView from './components/glider-views/glider-list-view';
import GliderView from './components/glider-views/glider-view';
import StatsView from './components/stats-views/stats-view';
import PilotFlightsUpload from './components/pilot-views/pilot-flights-upload';
import PilotChangePassword from './components/pilot-views/pilot-change-password';
import PilotEditView from './components/pilot-views/pilot-edit-view';
import PilotView from './components/pilot-views/pilot-view';
import Signup from './components/public-views/signup';
import Login from './components/public-views/login';
import OneTimeLogin from './components/public-views/one-time-login';
import InitiateResetPassword from './components/public-views/initiate-reset-password';
import ResetPassword from './components/public-views/reset-password';
import EmailVerified from './components/public-views/email-verified';
import InvalidVerificationLink from './components/public-views/invalid-verification-link';
import PageNotFound from './components/public-views/page-not-found';


function mainApp() {
  ReactDOM.render(
    (
      <BrowserRouter history={browserHistory}>
        <ScrollToTop>
          <Koifly>
            <Switch>
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
              <Route component={PageNotFound}/>
            </Switch>
          </Koifly>
        </ScrollToTop>
      </BrowserRouter>
    ),
    document.getElementById('koifly')
  );
}


document.addEventListener('DOMContentLoaded', mainApp);
