/* eslint-disable no-unused-expressions */

'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const Simulate = TestUtils.Simulate;
const Promise = require('es6-promise').Promise;
const Chai = require('chai');
const expect = Chai.expect;
const Sinon = require('sinon');
const sinonChai = require('sinon-chai');
Chai.use(sinonChai);

const InteractiveMap = require('../../src/components/common/maps/interactive-map');


describe('InteractiveMap component', () => {

  let component;
  let renderedDOMMapContainer;

  const defaults = {
    refsName: 'map',
    dimmerClass: 'dimmer'
  };

  const mocks = {
    markerId: 42,
    mapCenter: { lat: 56.78, lng: 34.567 },
    mapZoomLevel: 4,
    markerPosition: { lat: 56.78, lng: 34.567 },
    siteLocation: 'test location',
    siteLaunchAltitude: 1234,
    altitudeUnit: 'feet',
    handleDataApply: Sinon.spy(),
    handleMapClose: Sinon.spy(),

    mapFacade: {
      createMap: Sinon.spy(),
      createMarker: Sinon.spy(),
      createInfowindow: Sinon.spy(),
      bindMarkerAndInfowindow: Sinon.spy(),
      addSearchBarControl: Sinon.spy(),
      getPositionInfoPromise: Sinon.stub().returns(Promise.reject())
    }
  };


  describe('Defaults and behavior testing', () => {
    before(() => {

      const mapFacadePromise = Promise.resolve(mocks.mapFacade);

      component = TestUtils.renderIntoDocument(
        <InteractiveMap
          markerId={mocks.markerId}
          center={mocks.mapCenter}
          zoomLevel={mocks.mapZoomLevel}
          markerPosition={mocks.markerPosition}
          location={mocks.siteLocation}
          launchAltitude={mocks.siteLaunchAltitude}
          altitudeUnit={mocks.altitudeUnit}
          onDataApply={mocks.handleDataApply}
          onMapClose={mocks.handleMapClose}
          mapFacadePromise={mapFacadePromise}
        />
      );

      renderedDOMMapContainer = component.refs[defaults.refsName];
    });


    it('renders map and pass it proper props', () => {
      expect(mocks.mapFacade.createMap).to.have.been.calledOnce;
      expect(mocks.mapFacade.createMap).to.have.been.calledWith(renderedDOMMapContainer, mocks.mapCenter, mocks.mapZoomLevel);

      expect(mocks.mapFacade.createMarker).to.have.been.calledOnce;
      expect(mocks.mapFacade.createMarker).to.have.been.calledWith(mocks.markerId, mocks.markerPosition);

      expect(mocks.mapFacade.createInfowindow).to.have.been.calledOnce;
      expect(mocks.mapFacade.createInfowindow).to.have.been.calledWith(mocks.markerId);

      expect(mocks.mapFacade.bindMarkerAndInfowindow).to.have.been.calledOnce;
      expect(mocks.mapFacade.bindMarkerAndInfowindow).to.have.been.calledWith(mocks.markerId);

      expect(mocks.mapFacade.addSearchBarControl).to.have.been.calledOnce;
      expect(mocks.mapFacade.addSearchBarControl).to.have.been.calledWith(mocks.markerId);

      expect(mocks.mapFacade.getPositionInfoPromise).to.have.been.calledOnce;
    });

    it('calls close function when map background is clicked', () => {
      const renderedDOMElement = ReactDOM.findDOMNode(component);
      const backGround = renderedDOMElement.querySelector(`.${defaults.dimmerClass}`);

      Simulate.click(backGround);

      expect(mocks.handleMapClose).to.have.been.calledOnce;
    });
  });


  describe('Empty marker position testing (creating new site)', () => {
    before(() => {

      const mapFacadePromise = Promise.resolve(mocks.mapFacade);

      component = TestUtils.renderIntoDocument(
        <InteractiveMap
          onDataApply={mocks.handleDataApply}
          onMapClose={mocks.handleMapClose}
          mapFacadePromise={mapFacadePromise}
        />
      );
    });

    it('doesn\'t request marker position info', () => {
      expect(mocks.mapFacade.getPositionInfoPromise).to.have.been.calledOnce; // still
    });
  });
});
