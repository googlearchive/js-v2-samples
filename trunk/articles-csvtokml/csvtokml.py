import geocoding_for_kml
import csv
import xml.dom.minidom
import sys


def extractAddress(row):
  # This extracts an address from a row and returns it as a string. This requires knowing
  # ahead of time what the columns are that hold the address information.
  return '%s,%s,%s,%s,%s' % (row['Address1'], row['Address2'], row['City'], row['State'], row['Zip'])

def createPlacemark(kmlDoc, row, columnOrder):
  # This creates a <Placemark> element for a row of data.
  # A row is a dict.
  placemarkElement = kmlDoc.createElement('Placemark')
  extElement = kmlDoc.createElement('ExtendedData')
  placemarkElement.appendChild(extElement)
  
  for key in columnOrder:
    dataElement = kmlDoc.createElement('Data')
    dataElement.setAttribute('name', key)
    valueElement = kmlDoc.createElement('value')
    dataElement.appendChild(valueElement)
    valueText = kmlDoc.createTextNode(row[key])
    valueElement.appendChild(valueText)
    extElement.appendChild(dataElement)
  
  pointElement = kmlDoc.createElement('Point')
  placemarkElement.appendChild(pointElement)
  coordinates = geocoding_for_kml.geocode(extractAddress(row))
  coorElement = kmlDoc.createElement('coordinates')
  coorElement.appendChild(kmlDoc.createTextNode(coordinates))
  pointElement.appendChild(coorElement)
  return placemarkElement

def createKML(csvReader, fileName, order = None):
  # This constructs the KML document from the CSV file.
  kmlDoc = xml.dom.minidom.Document()
  
  kmlElement = kmlDoc.createElementNS('http://earth.google.com/kml/2.2', 'kml')
  kmlElement = kmlDoc.appendChild(kmlElement)
  documentElement = kmlDoc.createElement('Document')
  documentElement = kmlElement.appendChild(documentElement)

  # If an argument was passed to the script, it splits the argument on a comma
  # and uses the resulting list to specify an order for when columns get added.
  columnOrder = None
  if order:
    columnOrder = order.split(',')
  for row in csvReader:
    if columnOrder == None: columnOrder = row.keys()
    placemarkElement = createPlacemark(kmlDoc, row, columnOrder)
    documentElement.appendChild(placemarkElement)
  kmlFile = open(fileName, 'w')
  kmlFile.write(kmlDoc.toprettyxml('  ', newl = '\n', encoding = 'utf-8'))

def main():
  # This reader opens up 'google-addresses.csv', which should be replaced with your own.
  # It creates a KML file called 'google.kml'.
  csvreader = csv.DictReader(open('google-addresses.csv'))
  kml = createKML(csvreader, 'google-addresses.kml', sys.argv[1])

if __name__ == '__main__':
  main()