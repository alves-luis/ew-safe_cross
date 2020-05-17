import xml.etree.ElementTree as ET
import requests

xml = open('query.xml', 'r').read()
header = {'Content-Type': 'application/xml'}
print(requests.post('https://lz4.overpass-api.de/api/interpreter', data=xml, headers=header).text)

osm = ET.parse('crosswalks.xml').getroot()
for node in osm:
  lat = node.get('lat')
  lon = node.get('lon')
  r = requests.post('http://localhost:3000/v1/crosswalks/', json={'lon': lon, 'lat': lat})
  print(f"Status code: {r.status_code}")