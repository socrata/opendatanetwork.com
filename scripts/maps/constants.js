
const MapConstants = {
    // Same base layer as Data Lens
    BASE_LAYER_URL: 'https://a.tiles.mapbox.com/v3/socrata-apps.ibp0l899/{z}/{x}/{y}.png',
    // Change to 0.15 to make the maps look like Data Lens
    BASE_LAYER_OPACITY: 0.5,
    // See http://bl.ocks.org/mbostock/5577023 for a visual index of Color Brewer colors
    COLOR_SCALE: colorbrewer.RdYlBu[9],
    ATTRIBUTION: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',

    INITIAL_CENTER: [37.1669, -95.9669], // Center of US
    // BOUNDS currently disabled!
    BOUNDS_SOUTH_WEST: [18.9117, -179.1506],
    BOUNDS_NORTH_EAST: [71.4410, -66.9406],
    MIN_ZOOM: 3.0,
    MAX_ZOOM: 12.0,
    INITIAL_ZOOM: 4.0,
    PLACE_ZOOM: 10.0, // Place auto-zoom level
    AUTOZOOM_PADDING: 100.0,

    REGION_BORDER_COLOR: '#34495e',
    REGION_BORDER_WEIGHT: 1,
    REGION_FILL_OPACITY: 1,

    REFERENCE_BORDER_COLOR: '#2c3e50',
    REFERENCE_BORDER_WEIGHT: 2,

    POINT_RADIUS_RANGE_METERS: [500, 2000],
    POINT_FILL_OPACITY: 1,

    LOADING_TOOLTIP_NAME: 'Loading',

    REGION_SELECT_WIDTH: 150,
    VARIABLE_SELECT_WIDTH: 300,

    // Leaflet map interaction options
    // http://leafletjs.com/reference.html#map-class
    OPTIONS: {scrollWheelZoom: false, bounceAtZoomLimits: false},

    GAZETTEER_URL: 'https://federal.demo.socrata.com/resource/gm3u-gw57.json',
    ROSTER_URL: 'https://federal.demo.socrata.com/resource/7g2b-8brv.json',

    TOPOJSON_DIRECTORY: 'geo/',
    TOPOJSON_SUFFIX: '.topo.json',

    REGIONS: {
        nation: {name: 'USA', id: 'nation', topo: 'nation'},
        region: {name: 'Regions', id: 'region', topo: 'region'},
        division: {name: 'Divisions', id: 'division', topo: 'division'},
        state: {name: 'States', id: 'state', topo: 'state'},
        county: {name: 'Counties', id: 'county', topo: 'county'},
        msa: {name: 'Metros', id: 'msa', topo: 'cbsa'},
        place: {name: 'Cities', id: 'place', topo: 'state'}
    };
};
