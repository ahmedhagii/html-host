#! usr/bin/env python

from sys import argv
from os.path import exists
import json

script, in_file, out_file = argv

data = open(in_file, 'r').read().split("\n")

geojson = [
{
    "type": "Feature",
    "geometry" : {
        "type": "Point",
        "coordinates": [float(d.split(",")[15]), float(d.split(",")[14])],
    },
    "properties" : d.split(",")[0],
} 
for d in data[1:100000] if d.split(",")[15] != ''
]


output = open(out_file, 'w')
json.dump(geojson, output)

#  print geojson
