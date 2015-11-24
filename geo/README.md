
# Geo

This directory contains TopoJSON files for various regions.

The `download_topo.sh` script can be used to generate new topography files.
It downloads shapefiles from the
[Census](https://www.census.gov/geo/maps-data/data/tiger-cart-boundary.html),
converts them to GeoJSON, and then to TopoJSON.
For some region types, like counties and metros, the script will
add a layer for states as well.
