
const MapConstants = {
    GEOCODE_URL: 'https://odn.data.socrata.com/resource/gm3u-gw57.json',

    // Maximum number of regions to display
    LIMIT: 5000,

    CSS_ID: 'leaflet-map',

    MAPBOX_TOKEN: 'pk.eyJ1IjoibGFuZWFhc2VuIiwiYSI6ImYxZjExYmYzOTMxYzgyZTc2NDY0NDBmNDNmZmEwYWM3In0.uy5ta6EsSEZggkVQHo2ygw',
    LABEL_LAYER_ID: 'socrata-apps.cb421623',
    BASE_LAYER_ID: 'socrata-apps.af2cc4ed',

    // See http://bl.ocks.org/mbostock/5577023 for a visual index of Color Brewer colors
    COLOR_SCALE: colorbrewer.Blues[9].slice(2),
    STOPLIGHT_COLOR_SCALE: colorbrewer.RdYlGn[7],
    SCALE: Scale.quantile,

    // http://leafletjs.com/reference.html#map-options
    MAP_OPTIONS: {
        minZoom: 3.0,
        maxZoom: 18.0,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false
    },

    ZOOM_CONTROL: true,
    ZOOM_CONTROL_OPTIONS: {
        position: 'topleft'
    },

    INITIAL_CENTER: [37.1669, -95.9669], // Center of US
    INITIAL_ZOOM: 4.0,

    // http://leafletjs.com/reference.html#map-fitboundsoptions
    AUTO_ZOOM_OPTIONS: {
        animate: false,
        maxZoom: 10.0,
        paddingTopLeft: [50, 0]
    },
    AUTO_ZOOM_OUT: 1, // amount to zoom out with only one selected region

    NO_DATA_POPUP_OPTIONS: {
        className: 'no-data-popup',
        closeButton: false
    },

    POI_ZOOM: 11.0, // auto zoom for point of interest maps
    POI_WAIT_MS: 100, // amount of time to wait to debounce updates

    POINT_RADIUS_SCALE: d3.scale.log,
    POINT_RADIUS_RANGE_METERS: [500, 2000],

    // http://leafletjs.com/reference.html#path-options
    BASE_STYLE: {
        stroke: true,
        color: '#2c3e50',
        opacity: 1,
        weight: 2,
        fill: false
    },

    REFERENCE_STYLE: {
        fill: true,
        fillOpacity: 0.35,
        stroke: true,
        weight: 1,
        opacity: 1
    },

    SELECTED_STYLE: {
        weight: 6,
        dashArray: '4, 8',
        lineCap: 'round'
    },

    NO_DATA_STYLE: {
        fill: false,
        stroke: false
    },

    LEGEND_OPACITY: 0.5,

    // http://leafletjs.com/reference.html#popup
    TOOLTIP_OPTIONS: {
        offset: L.point(0, -20),
        closeButton: false,
        closeOnClick: false
    },
    TOOLTIP_PADDING: 16,

    POPUP_OPTIONS: {
        closeButton: false,
        closeOnClick: false
    },

    TOPOJSON_DIRECTORY: '/geo/',
    TOPOJSON_SUFFIX: '.topo.json',

    REGIONS: {
        nation: {name: 'USA', id: 'nation', topo: 'nation', type: 'choropleth'},
        region: {name: 'Regions', id: 'region', topo: 'region', type: 'choropleth'},
        division: {name: 'Divisions', id: 'division', topo: 'division', type: 'choropleth'},
        state: {name: 'States', id: 'state', topo: 'state', type: 'choropleth'},
        county: {name: 'Counties', id: 'county', topo: 'county', type: 'choropleth'},
        msa: {name: 'Metros', id: 'msa', topo: 'cbsa', type: 'choropleth'},
        place: {name: 'Cities', id: 'place', topo: 'places', type: 'point'}
    },

    DEFAULT_REGION: 'state'
};

