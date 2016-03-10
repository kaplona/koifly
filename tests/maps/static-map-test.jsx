'use strict';

require('../../src/test-dom')();

var React = require('react/addons');
var _ = require('lodash');

var StaticMap = require('../../src/components/common/maps/static-map');

var SiteModel = require('../../src/models/site');
var Map = require('../../src/utils/map');

var then = require('../../src/utils/then');
var Chai = require('chai');
var expect = Chai.expect;
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
Chai.use(sinonChai);



describe('StaticMap component', () => {

    var TestUtils = React.addons.TestUtils;

    var component;

    var defaults = {
        refsName: 'map',
        fullScreenClass: 'x-full-screen'
    };

    var mocks = {
        mapCenter: { lat: 56.78, lng: 34.567 },
        mapZoomLevel: 4,
        markerList: [
            {
                id: 42,
                name: 'first name',
                location: 'first location',
                launchAltitude: 1234,
                altitudeUnit: 'meters',
                coordinates: 'first coordinates'
            },
            {
                id: 96,
                name: 'second name',
                location: 'second location',
                launchAltitude: 4100,
                altitudeUnit: 'meters',
                coordinates: 'second coordinates'
            },
            {
                id: 32,
                name: 'third name',
                location: 'third location',
                launchAltitude: 2300,
                altitudeUnit: 'meters',
                coordinates: 'third coordinates'
            }
        ]
    };


    describe('Defaults and behavior testing', () => {
        // var MapsApiMock;
        var Sandbox;
        var MapMock;
        var MapReal = {
            isLoaded: Map.isLoaded,
            createMap: Map.createMap,
            createMarker: Map.createMarker,
            createInfowindow: Map.createInfowindow,
            bindMarkerAndInfowindow: Map.bindMarkerAndInfowindow
        };

        before(() => {
            // we are using Sinon sandbox to restore mocked objects after test
            Sandbox = Sinon.sandbox.create();

            MapMock = Sandbox.stub(Map);
            _.extend(MapMock, {
                isLoaded: true,
                createMap: Sandbox.spy(),
                createMarker: Sandbox.spy(),
                createInfowindow: Sandbox.spy(),
                bindMarkerAndInfowindow: Sandbox.spy()
            });

            Sandbox.stub(SiteModel, 'getLatLngCoordinates', () => {
                return null;
            });

            component = TestUtils.renderIntoDocument(
                <StaticMap
                    center={ mocks.mapCenter }
                    zoomLevel={ mocks.mapZoomLevel }
                    markers={ mocks.markerList }
                    />
            );
        });

        after(() => {
            _.extend(MapMock, MapReal);
            Sandbox.restore();
        });

        it('doesn\'t render full screen map by default', () => {
            let className = React.findDOMNode(component).className;

            expect(className).to.not.contain(defaults.fullScreenClass);
        });

        it('renders map and pass it proper props', () => {
            let mapContainer = React.findDOMNode(component.refs[defaults.refsName]);

            expect(Map.createMap).to.have.been.calledOnce;
            expect(Map.createMap).to.have.been.calledWith(mapContainer, mocks.mapCenter, mocks.mapZoomLevel);

            expect(Map.createMarker).to.have.been.calledThrice;
            expect(Map.createMarker.getCall(0)).to.have.been.calledWith(mocks.markerList[0].id);
            expect(Map.createMarker.getCall(1)).to.have.been.calledWith(mocks.markerList[1].id);
            expect(Map.createMarker.getCall(2)).to.have.been.calledWith(mocks.markerList[2].id);

            expect(Map.createInfowindow).to.have.been.calledThrice;
            expect(Map.createInfowindow.getCall(0)).to.have.been.calledWith(mocks.markerList[0].id);
            expect(Map.createInfowindow.getCall(1)).to.have.been.calledWith(mocks.markerList[1].id);
            expect(Map.createInfowindow.getCall(2)).to.have.been.calledWith(mocks.markerList[2].id);

            // Check that second parameter (infowindow content) contains site information
            let infowindowContents = [
                Map.createInfowindow.getCall(0).args[1],
                Map.createInfowindow.getCall(1).args[1],
                Map.createInfowindow.getCall(2).args[1]
            ];

            expect(infowindowContents[0]).to.contain(mocks.markerList[0].id);
            expect(infowindowContents[0]).to.contain(mocks.markerList[0].name);
            expect(infowindowContents[0]).to.contain(mocks.markerList[0].location);
            expect(infowindowContents[0]).to.contain(mocks.markerList[0].launchAltitude);
            expect(infowindowContents[0]).to.contain(mocks.markerList[0].altitudeUnit);
            expect(infowindowContents[0]).to.contain(mocks.markerList[0].coordinates);

            expect(infowindowContents[1]).to.contain(mocks.markerList[1].id);
            expect(infowindowContents[1]).to.contain(mocks.markerList[1].name);
            expect(infowindowContents[1]).to.contain(mocks.markerList[1].location);
            expect(infowindowContents[1]).to.contain(mocks.markerList[1].launchAltitude);
            expect(infowindowContents[1]).to.contain(mocks.markerList[1].altitudeUnit);
            expect(infowindowContents[1]).to.contain(mocks.markerList[1].coordinates);

            expect(infowindowContents[2]).to.contain(mocks.markerList[2].id);
            expect(infowindowContents[2]).to.contain(mocks.markerList[2].name);
            expect(infowindowContents[2]).to.contain(mocks.markerList[2].location);
            expect(infowindowContents[2]).to.contain(mocks.markerList[2].launchAltitude);
            expect(infowindowContents[2]).to.contain(mocks.markerList[2].altitudeUnit);
            expect(infowindowContents[2]).to.contain(mocks.markerList[2].coordinates);

            expect(Map.bindMarkerAndInfowindow).to.have.been.calledThrice;
            expect(Map.bindMarkerAndInfowindow.getCall(0)).to.have.been.calledWith(mocks.markerList[0].id);
            expect(Map.bindMarkerAndInfowindow.getCall(1)).to.have.been.calledWith(mocks.markerList[1].id);
            expect(Map.bindMarkerAndInfowindow.getCall(2)).to.have.been.calledWith(mocks.markerList[2].id);
        });
    });

    describe('Sinon sandbox cleared all stubs', () => {
        it('cleared isLoaded', () => {
            expect(Map.isLoaded).to.equal(false);
        });

        it('cleared mocked functions', () => {
            expect(Map.createMap).to.not.be.instanceof(Object);
        });
    });


    describe('Full screen testing', () => {

        before(() => {
            component = TestUtils.renderIntoDocument(
                <StaticMap
                    center={ mocks.mapCenter }
                    zoomLevel={ mocks.mapZoomLevel }
                    markers={ mocks.markerList }
                    isFullScreen={ true }
                    />
            );
        });

        it('renders full screen map', () => {
            let className = React.findDOMNode(component).className;

            expect(className).to.contain(defaults.fullScreenClass);
        });
    });
});
