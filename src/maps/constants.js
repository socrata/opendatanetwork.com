
const MapConstants = {
    MAP_NEW_URL: 'http://api.opendatanetwork.com/data/v1/map/new',
    MAP_VALUES_URL: 'http://api.opendatanetwork.com/data/v1/map/values',
    MAP_VALUES_WS_URL: 'ws://api.opendatanetwork.com/data/v1/map/values',

    // Milliseconds to wait before updating map after move or zoom.
    UPDATE_WAIT: 200,

    APP_TOKEN: 'CqcTvF7wVsI8IYAq7CdZszLbU',

    CSS_ID: 'leaflet-map',

    MAPBOX_TOKEN: 'pk.eyJ1IjoibGFuZWFhc2VuIiwiYSI6ImYxZjExYmYzOTMxYzgyZTc2NDY0NDBmNDNmZmEwYWM3In0.uy5ta6EsSEZggkVQHo2ygw',
    LABEL_LAYER_ID: 'socrata-apps.cb421623',
    BASE_LAYER_ID: 'socrata-apps.af2cc4ed',

    // See http://bl.ocks.org/mbostock/5577023 for a visual index of Color Brewer colors
    COLOR_SCALE: colorbrewer.Blues[9].slice(1),
    STOPLIGHT_COLOR_SCALE: colorbrewer.RdYlGn[8],

    // http://leafletjs.com/reference.html#map-options
    MAP_OPTIONS: {
        minZoom: 3.0,
        maxZoom: 18.0,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        bounceAtZoomLimits: false
    },

    ZOOM_CONTROL: true,
    ZOOM_CONTROL_OPTIONS: {
        position: 'topleft'
    },

    // http://leafletjs.com/reference.html#map-fitboundsoptions
    INITIAL_ZOOM_OPTIONS: {
        animate: false,
        maxZoom: 10.0,
        padding: [50, 50]
    },

    POI_ZOOM: 11.0, // auto zoom for point of interest maps
    POI_WAIT_MS: 100, // amount of time to wait to debounce updates

    // http://leafletjs.com/reference.html#path-options
    BASE_STYLE: {
        fill: true,
        fillOpacity: 0.35,
        stroke: true,
        color: '#2c3e50',
        weight: 1,
        opacity: 1
    },

    SELECTED_STYLE: {
        weight: 6,
        dashArray: '4, 8',
        lineCap: 'round'
    },

    LEGEND_OPACITY: 0.5,

    TOOLTIP_PADDING: 16,

    POPUP_OPTIONS: {
        closeButton: true,
        closeOnClick: false
    }
};

