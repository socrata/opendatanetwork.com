
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


PATH = 'gazetteer.csv'
NUMBER = 5000 # exports NUMBER most populous cities

def get_places():
    with open(PATH, encoding='latin') as csv_file:
        reader = csv.DictReader(csv_file)

        return [row for row in reader
                if row.get('type') == 'place']


def to_topojson(places):
    def to_geometry(place):
        return {
            'type': 'Point',
            'id': place.get('id'),
            'coordinates': [float(place.get('longitude')), float(place.get('latitude'))],
            'properties': {
                'population': int(place.get('population'))
            }
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
    sorted_places = sorted(places, key=lambda row: int(row.get('population')), reverse=True)
    topojson = to_topojson(sorted_places[:NUMBER])

    with open('places.topo.json', 'w') as out:
        json.dump(topojson, out)

