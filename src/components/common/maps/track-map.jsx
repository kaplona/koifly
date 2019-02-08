'use strict';

const React = require('react');

const CENTER = require('../../../constants/map-constants').CENTER;
const PROP_TYPES = require('../../../constants/prop-types');
const ZOOM_LEVEL = require('../../../constants/map-constants').ZOOM_LEVEL;


require('./map.less');


const { arrayOf, bool } = React.PropTypes;

const TrackMap = React.createClass({

    propTypes: {
        isFullScreen: bool,
        markerCoords: PROP_TYPES.coordinates,
        trackCoords: arrayOf(PROP_TYPES.coordinates).isRequired,
        mapFacadePromise: PROP_TYPES.promise.isRequired,
    },

    getDefaultProps: function() {
        return {
            isFullScreen: false
        };
    },

    componentDidMount: function() {
        this.props.mapFacadePromise.then(mapFacade => {
            this.mapFacade = mapFacade;
            this.createMap();
        });
    },

    componentWillReceiveProps(nextProps) {
        if (this.mapFacade && nextProps.trackCoords !== this.props.trackCoords) {
            this.mapFacade.updateFlightTrack(nextProps.trackCoords);
        }
        if (
            this.mapFacade && !!nextProps.markerCoords && !!this.props.markerCoords &&
            nextProps.markerCoords.lat !== this.props.markerCoords.lat &&
            nextProps.markerCoords.lng !== this.props.markerCoords.lng
        ) {
            this.mapFacade.moveTrackMarker(nextProps.markerCoords);
        }
    },

    shouldComponentUpdate: function() {
        return false;
    },

    createMap: function() {
        const mapContainer = this.refs.map;
        const center = this.props.trackCoords[0] || CENTER.region;
        this.mapFacade.createMap(mapContainer, center, ZOOM_LEVEL.track);

        if (this.props.trackCoords) {
            this.mapFacade.createFlightTrack(this.props.trackCoords);
        }
        if (this.props.markerCoords) {
            this.mapFacade.moveTrackMarker(this.props.markerCoords);
        }
    },

    render: function() {
        const className = this.props.isFullScreen ? 'map-container x-full-screen' : 'map-container';

        return (
            <div className={ this.props.isFullScreen ? 'static-wrapper' : null }>
                <div className={ className } ref='map'/>
            </div>
        );
    }
});



TrackMap.create = function(props) { // eslint-disable-line react/no-multi-comp
    // this loads external google-maps-api
    const mapFacadePromise = require('../../../utils/map-facade').createPromise();

    return (
        <TrackMap
            {...props}
            mapFacadePromise={ mapFacadePromise }
            />
    );
};


module.exports = TrackMap;
