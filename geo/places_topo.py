
"""
Generates a TopoJSON file for places in the US.
Requires Gazetteer file from metro.

File available at these places:
    https://github.com/socrata/metro/tree/master/etl#data-directory
    https://federal.demo.socrata.com/view/p5cc-m8dh

Run with Python 3.
"""


import csv
import json


PATH = 'data/gazetteer/formatted/gazetteer.csv'

def get_places():
    with open(PATH, encoding='latin') as csv_file:
        reader = csv.DictReader(csv_file)

        return [row for row in reader if row.get('type') == 'place']


def to_topojson(places):
    def to_geometry(place):
        return {
            'type': 'Point',
            'id': place.get('id'),
            'coordinates': [place.get('longitude'), place.get('latitude')]
        }

    return {
        'type': 'Topology',
        'objects': {
            'place': {
                'type': 'GeometryCollection',
                'geometries': list(map(to_geometry, places))
            }
        }
    }


if __name__ == '__main__':
    places = get_places()
    topojson = to_topojson(places)

    with open('places.topo.json', 'w') as out:
        json.dump(topojson, out)

