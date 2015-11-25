
const MapConstants = {
    // Same base layer as Data Lens
    BASE_LAYER_URL: 'https://a.tiles.mapbox.com/v3/socrata-apps.ibp0l899/{z}/{x}/{y}.png',
    BASE_LAYER: {
        opacity: 0.5 // Change to 0.15 to make the maps look like Data Lens
    },

    // See http://bl.ocks.org/mbostock/5577023 for a visual index of Color Brewer colors
    COLOR_SCALE: colorbrewer.RdYlBu[9],
    SCALE: Scale.quantile,

    // Leaflet map options:
    // http://leafletjs.com/reference.html#map-class
    MAP_OPTIONS: {
        minZoom: 3.0,
        maxZoom: 12.0,
        zoomControl: false,
        attributionControl: false
    },

    INITIAL_CENTER: [37.1669, -95.9669], // Center of US
    INITIAL_ZOOM: 4.0,

    AUTO_ZOOM_OPTIONS: {
        padding: [100.0, 100.0]
    },

    REGION_BORDER_COLOR: '#34495e',
    REGION_BORDER_WEIGHT: 1,
    REGION_FILL_OPACITY: 1,

    REFERENCE_BORDER_COLOR: '#2c3e50',
    REFERENCE_BORDER_WEIGHT: 2,

    LOADING_TOOLTIP_NAME: 'Loading',

    GAZETTEER_URL: 'https://federal.demo.socrata.com/resource/gm3u-gw57.json',
    ROSTER_URL: 'https://federal.demo.socrata.com/resource/7g2b-8brv.json',

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

