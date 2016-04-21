/* eslint-disable no-unused-expressions */

'use strict';

require('../../src/test-dom')();

var React = require('react/addons');
var Promise = require('es6-promise').Promise;

var StaticMap = require('../../src/components/common/maps/static-map');

var Chai = require('chai');
var expect = Chai.expect;
var Sinon = require('sinon');
var sinonChai = require('sinon-chai');
Chai.use(sinonChai);



describe('StaticMap component', () => {

    var TestUtils = React.addons.TestUtils;

    var component;
    var renderedDOMMapContainer;

    var defaults = {
        refsName: 'map',
        fullScreenClass: 'x-full-screen'
    };

    var mocks = {
        mapCenter: { lat: 56.78, lng: 34.567 },
        mapZoomLevel: 4,

        sites: [
            {
                id: 42,
                name: 'first name',
                location: 'first location',
                launchAltitude: 1234,
                altitudeUnit: 'meters',
                coordinates: 'first coordinates',
                latLng: { lat: 10.32423, lng: -123.4534 }
            },
            {
                id: 96,
                name: 'second name',
                location: 'second location',
                launchAltitude: 4100,
                altitudeUnit: 'meters',
                coordinates: 'second coordinates',
                latLng: { lat: 56.093234, lng: 42.93425 }
            },
            {
                id: 32,
                name: 'third name',
                location: 'third location',
                launchAltitude: 2300,
                altitudeUnit: 'meters',
                coordinates: 'third coordinates',
                latLng: { lat: -43.34526, lng: 23.218973 }
            }
        ],

        mapFacade: {
            createMap: Sinon.spy(),
            createMarker: Sinon.spy(),
            createInfowindow: Sinon.spy(),
            bindMarkerAndInfowindow: Sinon.spy()
        }
    };


    describe('Defaults and behavior testing', () => {
        before(() => {

            var mapFacadePromise = Promise.resolve(mocks.mapFacade);

            component = TestUtils.renderIntoDocument(
                <StaticMap
                    center={ mocks.mapCenter }
                    zoomLevel={ mocks.mapZoomLevel }
                    sites={ mocks.sites }
                    mapFacadePromise={ mapFacadePromise }
                    />
            );

            renderedDOMMapContainer = React.findDOMNode(component.refs[defaults.refsName]);
        });


        it('doesn\'t render full screen map by default', () => {
            let className = renderedDOMMapContainer.className;

            expect(className).to.not.contain(defaults.fullScreenClass);
        });

        it('renders map and pass it proper props', () => {
            expect(mocks.mapFacade.createMap).to.have.been.calledOnce;
            expect(mocks.mapFacade.createMap).to.have.been.calledWith(renderedDOMMapContainer, mocks.mapCenter, mocks.mapZoomLevel);

            expect(mocks.mapFacade.createMarker).to.have.been.calledThrice;
            expect(mocks.mapFacade.createMarker.getCall(0)).to.have.been.calledWith(mocks.sites[0].id, mocks.sites[0].latLng);
            expect(mocks.mapFacade.createMarker.getCall(1)).to.have.been.calledWith(mocks.sites[1].id, mocks.sites[1].latLng);
            expect(mocks.mapFacade.createMarker.getCall(2)).to.have.been.calledWith(mocks.sites[2].id, mocks.sites[2].latLng);

            expect(mocks.mapFacade.createInfowindow).to.have.been.calledThrice;
            expect(mocks.mapFacade.createInfowindow.getCall(0)).to.have.been.calledWith(mocks.sites[0].id);
            expect(mocks.mapFacade.createInfowindow.getCall(1)).to.have.been.calledWith(mocks.sites[1].id);
            expect(mocks.mapFacade.createInfowindow.getCall(2)).to.have.been.calledWith(mocks.sites[2].id);

            // Check that second parameter (infowindow content) contains site information
            let infowindowContents = [
                mocks.mapFacade.createInfowindow.getCall(0).args[1],
                mocks.mapFacade.createInfowindow.getCall(1).args[1],
                mocks.mapFacade.createInfowindow.getCall(2).args[1]
            ];

            expect(infowindowContents[0]).to.contain(mocks.sites[0].id);
            expect(infowindowContents[0]).to.contain(mocks.sites[0].name);
            expect(infowindowContents[0]).to.contain(mocks.sites[0].location);
            expect(infowindowContents[0]).to.contain(mocks.sites[0].launchAltitude);
            expect(infowindowContents[0]).to.contain(mocks.sites[0].altitudeUnit);
            expect(infowindowContents[0]).to.contain(mocks.sites[0].coordinates);

            expect(infowindowContents[1]).to.contain(mocks.sites[1].id);
            expect(infowindowContents[1]).to.contain(mocks.sites[1].name);
            expect(infowindowContents[1]).to.contain(mocks.sites[1].location);
            expect(infowindowContents[1]).to.contain(mocks.sites[1].launchAltitude);
            expect(infowindowContents[1]).to.contain(mocks.sites[1].altitudeUnit);
            expect(infowindowContents[1]).to.contain(mocks.sites[1].coordinates);

            expect(infowindowContents[2]).to.contain(mocks.sites[2].id);
            expect(infowindowContents[2]).to.contain(mocks.sites[2].name);
            expect(infowindowContents[2]).to.contain(mocks.sites[2].location);
            expect(infowindowContents[2]).to.contain(mocks.sites[2].launchAltitude);
            expect(infowindowContents[2]).to.contain(mocks.sites[2].altitudeUnit);
            expect(infowindowContents[2]).to.contain(mocks.sites[2].coordinates);

            expect(mocks.mapFacade.bindMarkerAndInfowindow).to.have.been.calledThrice;
            expect(mocks.mapFacade.bindMarkerAndInfowindow.getCall(0)).to.have.been.calledWith(mocks.sites[0].id);
            expect(mocks.mapFacade.bindMarkerAndInfowindow.getCall(1)).to.have.been.calledWith(mocks.sites[1].id);
            expect(mocks.mapFacade.bindMarkerAndInfowindow.getCall(2)).to.have.been.calledWith(mocks.sites[2].id);
        });
    });


    describe('Full screen testing', () => {

        var mapFacadePromise = Promise.reject();

        before(() => {
            component = TestUtils.renderIntoDocument(
                <StaticMap
                    center={ mocks.mapCenter }
                    zoomLevel={ mocks.mapZoomLevel }
                    isFullScreen={ true }
                    mapFacadePromise={ mapFacadePromise }
                    />
            );
        });

        it('renders full screen map', () => {
            let className = React.findDOMNode(component.refs[defaults.refsName]).className;

            expect(className).to.contain(defaults.fullScreenClass);
        });
    });
});
