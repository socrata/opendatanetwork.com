
maps.view = function(selection, config, model, selected) {
    const container = selection
        .append('div')
        .attr('class', 'dynamic-map-container');

    const madId = 'leaflet-map';
    const mapContainer = container
        .append('div')
        .attr('id', madId);

    const selectContainer = container
        .append('div')
        .attr('class', 'select-container');

    const regionSelect = selectContainer
        .append('select');

    const variableSelect = selectContainer
        .append('select');

    const legendContainer = container
        .append('div')
        .attr('class', 'legend-container');

    const tip = maps.tooltip(mapContainer);

    const map = (function() {
        const map = L.map(madId, {
            minZoom: Constants.MAP_MIN_ZOOM,
            maxZoom: Constants.MAP_MAX_ZOOM
            // maxBounds: [Constants.MAP_BOUNDS_SOUTH_WEST, Constants.MAP_BOUNDS_NORTH_EAST]
        });

        map.setView(Constants.MAP_INITIAL_CENTER, Constants.MAP_INITIAL_ZOOM);

        L.tileLayer(Constants.MAP_BASE_LAYER_URL, {
            opacity: Constants.MAP_BASE_LAYER_OPACITY,
            attribution: Constants.MAP_ATTRIBUTION
        }).addTo(map);

        return map;
    })();

    const layers = (function() {
        let rendered = [];

        function add(layer) {
            rendered.push(layer);
        }

        function removeLayer(layer) {
            map.removeLayer(layer);
        }

        function remove() {
            _.each(rendered, removeLayer);
            rendered = [];
        }

        return {
            add: add,
            remove: remove
        };
    })();

    const regionSelection = (function() {
        const selectedStyle = {
            stroke: true,
            color: 'yellow',
            weight: 2,
            opacity: 1
        };

        function isSelected(region) {
            return _.contains(selected.ids, region.id);
        }

        function getStyle(region, styles) {
            if (isSelected(region)) {
                return _.extend({}, styles, selectedStyle);
            } else {
                return styles;
            }
        }

        function getRegionType() {
            const regionTypeId = selected.regions[0];
            const regionTypes = config.regions;
            const regionType = _.findWhere(regionTypes, {id: regionTypeId});

            if (!regionType) return config.defaultRegion;
            return regionType;
        }

        return {
            isSelected,
            getStyle,
            getRegionType
        };
    })();

    function drawQuantileScale(scale, values, variable) {
        legendContainer.selectAll('svg.legend').remove();

        const dimension = 10;
        const range = scale.range().slice();
        range.reverse();
        const height = range.length * dimension;
        const width = 240;
        const xOffset = width / 2;

        values = _.filter(values, value => !(isNaN(value)))
        const [min, max] = d3.extent(values);
        const lowerQuartile = d3.quantile(values, 0.25);
        const median = d3.median(values);
        const upperQuartile = d3.quantile(values, 0.75);

        const tickValues = [max, upperQuartile, median, lowerQuartile, min];
        const tickNames = ['maximum', 'upper quartile', 'median', 'lower quartile', 'minimum'];
        const tickData = _.zip(tickValues, tickNames);
        const tickStep = height / (tickData.length - 1);

        const legend = legendContainer
            .append('svg')
            .attr('width', width)
            .attr('height', height + 30 + dimension * 3)
            .attr('class', 'legend');

        const legendName = legend
            .append('text')
            .attr('class', 'legend-name')
            .attr('text-anchor', 'middle')
            .attr('x', xOffset + dimension / 2).attr('y', dimension * 1.2)
            .text(variable.name);

        const tickGroup = legend
            .append('g')
            .attr('class', 'ticks');

        const ticks = tickGroup
            .selectAll('g.tick')
            .data(tickData)
            .enter()
            .append('g')
            .attr('class', 'tick')
            .attr('transform', (__, index) => {
                return `translate(${xOffset}, ${3 * dimension + index * tickStep})`;
            });

        ticks
            .append('line')
            .attr('class', 'tick-line')
            .attr('x1', dimension).attr('y1', 0)
            .attr('x2', dimension * 2).attr('y2', 0);

        ticks
            .append('line')
            .attr('class', 'tick-line')
            .attr('x1', -dimension).attr('y1', 0)
            .attr('x2', 0).attr('y2', 0);

        const baseline = 'middle';
        const padding = 2;

        ticks
            .append('text')
            .attr('class', 'tick-value')
            .text(tick => variable.format(tick[0]))
            .attr('alignment-baseline', baseline)
            .attr('transform', `translate(${dimension * 2 + padding}, 0)`);

        ticks
            .append('text')
            .attr('class', 'tick-label')
            .text(tick => tick[1])
            .attr('text-anchor', 'end')
            .attr('alignment-baseline', baseline)
            .attr('transform', `translate(${-(dimension + padding)}, 0)`);

        const colors = legend
            .selectAll('rect')
            .data(range)
            .enter()
            .append('rect')
            .attr('class', 'legend-element')
            .attr('x', xOffset)
            .attr('y', (__, index) => (index + 3) * dimension)
            .attr('width', dimension)
            .attr('height', dimension)
            .style('stroke', 'none')
            .style('fill', color => color);

        legend
            .append('rect')
            .attr('class', 'legend-box')
            .attr('x', xOffset).attr('y', dimension * 3)
            .attr('width', dimension).attr('height', height);
    }

    function drawScale(scaleTuple) {
        const [scale, values, variable] = scaleTuple;

        drawQuantileScale(scale, values, variable);
    }

    function choropleth(topology, regionLookup, scale) {
        drawScale(scale);

        const selectedLayers = [];

        function styleLayer(layer) {
            const id = layer.feature.id;

            if (id in regionLookup) {
                const region = regionLookup[id];

                const regionStyle = {
                    stroke: true,
                    color: Constants.MAP_REGION_BORDER_COLOR,
                    weight: Constants.MAP_REGION_BORDER_WEIGHT,
                    fillColor: region.fill,
                    fillOpacity: Constants.MAP_REGION_FILL_OPACITY
                };

                layer.setStyle(regionSelection.getStyle(region, regionStyle));

                layer.on({
                    mouseover: function() { tip.show(region); },
                    mouseout: tip.hide
                });

                if (regionSelection.isSelected(region)) {
                    selectedLayers.push(layer);
                }
            } else { // if we don't have data for it it's reference layer
                layer.setStyle({
                    stroke: true,
                    color: Constants.MAP_REFERENCE_BORDER_COLOR,
                    weight: Constants.MAP_REFERENCE_BORDER_WEIGHT,
                    fill: false,
                    clickable: false
                });
            }
        }

        const topoLayer = omnivore.topojson.parse(topology);
        topoLayer
            .eachLayer(styleLayer)
            .addTo(map);

        // zoom to bounding box of selected regions
        const layerGroup = new L.featureGroup(selectedLayers);
        map.fitBounds(layerGroup.getBounds(), {padding: [Constants.MAP_AUTOZOOM_PADDING, Constants.MAP_AUTOZOOM_PADDING]});

        layers.add(topoLayer);
        tip.hide();
    }

    function pointMap(regionLookup, locationLookup, scale) {
        drawScale(scale);

        const availableIds = _.intersection(_.keys(regionLookup), _.keys(locationLookup));

        const population = feature => parseFloat(feature.population);
        const points = (() => {
            const points = _.map(_.values(locationLookup), _.property('location'));
            return _.sortBy(points, population);
        })();

        const populations = _.map(points, population);
        const radiusScale = d3.scale.log()
            .domain(d3.extent(populations))
            .range(Constants.MAP_POINT_RADIUS_RANGE_METERS);

        const pointStyle = {
            stroke: true,
            weight: 8,
            opacity: 0,
            pointerEvents: 'all',
            fill: true,
            fillOpacity: Constants.MAP_POINT_FILL_OPACITY
        };

        const selectedMarkers = [];

        function stylePoint(feature, coordinate) {
            const id = feature.id;

            if (id in regionLookup) {
                const region = regionLookup[id];

                const regionStyle = {
                    fillColor: region.fill
                };

                const baseStyle = _.extend(pointStyle, regionStyle);
                const style = regionSelection.getStyle(region, baseStyle);
                const marker = L.circle(coordinate, radiusScale(feature.population), style);

                marker.on({
                    mouseover: function() { tip.show(region); },
                    mouseout: tip.hide
                });

                if (regionSelection.isSelected(region)) {
                    selectedMarkers.push(marker);

                    L.marker(coordinate)
                        .addTo(map)
                        .bindPopup(region.name)
                        .openPopup();
                }

                return marker;
            } else {
                // console.warn('no point data found for: ' + id);

                return L.circleMarker(coordinate, {stroke: false, fill: false});
            }
        }

        const pointLayer = L.geoJson(points, {pointToLayer: stylePoint})
            .addTo(map);

        if (selectedMarkers.length == 1) {
            const marker = selectedMarkers[0];
            map.setView(marker.getLatLng(), Constants.MAP_PLACE_ZOOM, {animate: true});
        } else if (selectedMarkers.length > 1) {
            const markerGroup = new L.featureGroup(selectedMarkers);
            map.fitBounds(markerGroup.getBounds());
        }

        layers.add(pointLayer);
        tip.hide();
    }

    function update(region, variable) {
        if (!region) console.log('no region');
        if (!variable) console.log('no variable');

        layers.remove();

        tip.show({
            valueName: Constants.MAP_LOADING_TOOLTIP_NAME,
            valueFormatted: `${variable.name} for ${region.name}...`
        });

        if (region.id == 'place') {
            model.getPointData(config, region, variable, pointMap);
        } else {
            model.getChoroplethData(config, region, variable, choropleth);
        }
    }

    (function addControls() {
        const regions = config.regions;
        let selectedRegion = regionSelection.getRegionType();

        const variables = config.variables;
        let selectedVariable = config.defaultVariable;

        function updateView() {
            update(selectedRegion, selectedVariable);
        };

        function onSelectRegion(regionId) {
            selectedRegion = _.find(regions, region => region.id === regionId);
            updateView();
        };

        function onSelectVariable(variableId) {
            selectedVariable = _.find(variables, variable => variable.id === variableId);
            updateView();
        };

        function selectFactory(select, config, options, defaultOption, callback) {
            const option = Menu.optionFactory(_.property('name'), _.property('id'));
            const _options = _.map(options, option);
            const _defaultOption = option(defaultOption);

            Menu.create(select, config, _options, _defaultOption, callback);
        };

        selectFactory(regionSelect, {width: Constants.MAP_REGION_SELECT_WIDTH}, regions, selectedRegion, onSelectRegion);
        selectFactory(variableSelect, {width: Constants.MAP_VARIABLE_SELECT_WIDTH}, variables, selectedVariable, onSelectVariable);

        updateView(selectedRegion, selectedVariable);
    })();

    return {update};
}
