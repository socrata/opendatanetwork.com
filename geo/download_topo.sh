#!/bin/sh

regions=("nation" "region" "division" "state" "county" "cbsa")
year="2013"
id="AFFGEOID"

base_regions=("nation" "state")
other_regions=("region" "division" "county" "cbsa")

download_shapefile () {
    local region="$1"

    mkdir $region
    cd $region

    printf -v url "http://www2.census.gov/geo/tiger/GENZ%s/cb_%s_us_%s_20m.zip" $year $year $region
    printf -v destination "%s.zip" $region

    wget $url -O $destination
    unzip $destination
    cd ..
}

to_geojson () {
    local region="$1"
    local geojson="$2"
    
    ogr2ogr -f GeoJSON -skipfailures $geojson $region
}

to_topojson() {
    local topojson="$1"

    topojson -o $topojson --id-property $id ${*:2}
}

for region in "${regions[@]}"; do
    download_shapefile $region

    printf -v geojson "%s.geojson" $region
    to_geojson $region $geojson
done

for region in "${base_regions[@]}"; do
    printf -v geojson "%s.geojson" $region
    printf -v topojson "%s.topo.json" $region
    to_topojson $topojson $geojson
done

for region in "${other_regions[@]}"; do
    printf -v geojson "%s.geojson" $region
    printf -v topojson "%s.topo.json" $region
    to_topojson $topojson $geojson "state.geojson" "nation.geojson"
done
