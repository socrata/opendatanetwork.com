
const MapConstants = {
    // Maximum number of regions to display
    LIMIT: 5000,

    CSS_ID: 'leaflet-map',

    // Same base layer as Data Lens
    BASE_LAYER_URL: 'https://a.tiles.mapbox.com/v3/socrata-apps.ibp0l899/{z}/{x}/{y}.png',
    BASE_LAYER: {
        opacity: 0.5 // Change to 0.15 to make the maps look like Data Lens
    },

    // See http://bl.ocks.org/mbostock/5577023 for a visual index of Color Brewer colors
    COLOR_SCALE: colorbrewer.RdYlBu[9],
    SCALE: Scale.quantile,

    // http://leafletjs.com/reference.html#map-options
    MAP_OPTIONS: {
        minZoom: 3.0,
        maxZoom: 12.0,
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
        maxZoom: 10.0
    },

    POINT_RADIUS_SCALE: d3.scale.log,
    POINT_RADIUS_RANGE_METERS: [500, 2000],

    // http://leafletjs.com/reference.html#path-options
    BASE_STYLE: {
        color: '#34495e',
        weight: 1,
        opacity: 1,
        fill: false,
        fillOpacity: 1
    },

    SELECTED_STYLE: {
        stroke: true,
        color: '#8e44ad',
        weight: 3,
        opacity: 1
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

