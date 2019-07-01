import browserHistory from './browser-history';


const navigationService = {
  goToFlightLog() {
    browserHistory.push('/flights');
  },

  goToHomePage() {
    // need to request marketing page from the server
    window.location.href = '/';
  },

  goToLogin() {
    browserHistory.push('/login');
  },

  goToOneTimeLogin() {
    browserHistory.push('/one-time-login');
  },

  goToResetPassword() {
    browserHistory.push('/reset-password');
  },

  goToSignup() {
    browserHistory.push('/signup');
  },

  goToPilotView() {
    browserHistory.push('/pilot');
  },

  goToPilotEdit() {
    browserHistory.push('/pilot/edit');
  },

  goToPilotChangePassword() {
    browserHistory.push('/pilot/edit/change-password');
  },

  goToFlightsUpload() {
    browserHistory.push('/pilot/edit/flights-upload');
  },

  goToListView(modelKeyPlural) {
    browserHistory.push(`/${encodeURIComponent(modelKeyPlural)}`);
  },

  goToItemView(modelKeySingle, itemId) {
    browserHistory.push(`/${encodeURIComponent(modelKeySingle)}/${encodeURIComponent(itemId)}`);
  },

  goToEditView(modelKeySingle, itemId) {
    browserHistory.push(`/${encodeURIComponent(modelKeySingle)}/${encodeURIComponent(itemId)}/edit`);
  },

  goToNewItemView(modelKeySingle) {
    browserHistory.push(`/${encodeURIComponent(modelKeySingle)}/0/edit`);
  },

  goToSiteListView() {
    browserHistory.push('/sites');
  },

  goToSiteView(siteId) {
    browserHistory.push(`/site/${encodeURIComponent(siteId)}`);
  },

  goToSiteMapView() {
    browserHistory.push('/sites/map');
  },

  goToGliderListView() {
    browserHistory.push('/gliders');
  },

  goToStatsView() {
    browserHistory.push('/stats');
  }
};


export default navigationService;
