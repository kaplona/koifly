/* eslint-disable no-unused-expressions */

'use strict';

require('../../src/test-dom')();
var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var Simulate = TestUtils.Simulate;
var Promise = require('es6-promise').Promise;

var Chai = require('chai');
var expect = Chai.expect;
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
Chai.use(sinonChai);

var InteractiveMap = require('../../src/components/common/maps/interactive-map');



describe('InteractiveMap component', () => {

    var component;
    var renderedDOMMapContainer;

    var defaults = {
        refsName: 'map',
        dimmerClass: 'dimmer'
    };

    var mocks = {
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

            var mapFacadePromise = Promise.resolve(mocks.mapFacade);
            
            component = TestUtils.renderIntoDocument(
                <InteractiveMap
                    markerId={ mocks.markerId }
                    center={ mocks.mapCenter }
                    zoomLevel={ mocks.mapZoomLevel }
                    markerPosition={ mocks.markerPosition }
                    location={ mocks.siteLocation }
                    launchAltitude={ mocks.siteLaunchAltitude }
                    altitudeUnit={ mocks.altitudeUnit }
                    onDataApply={ mocks.handleDataApply }
                    onMapClose={ mocks.handleMapClose }
                    mapFacadePromise={ mapFacadePromise }
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
            let renderedDOMElement = ReactDOM.findDOMNode(component);
            let backGround = renderedDOMElement.querySelector(`.${defaults.dimmerClass}`);

            Simulate.click(backGround);

            expect(mocks.handleMapClose).to.have.been.calledOnce;
        });
    });


    describe('Empty marker position testing (creating new site)', () => {
        before(() => {

            var mapFacadePromise = Promise.resolve(mocks.mapFacade);

            component = TestUtils.renderIntoDocument(
                <InteractiveMap
                    onDataApply={ mocks.handleDataApply }
                    onMapClose={ mocks.handleMapClose }
                    mapFacadePromise={ mapFacadePromise }
                    />
            );
        });

        it('doesn\'t request marker position info', () => {
            expect(mocks.mapFacade.getPositionInfoPromise).to.have.been.calledOnce; // still
        });
    });
});
