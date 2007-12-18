import geocoding2
import csv
import xml.dom.minidom

def createKML(csvReader, fileName):
  # This constructs the KML document from the CSV file.
  kmlDoc = xml.dom.minidom.Document()
  
  kmlElement = kmlDoc.createElementNS('http://earth.google.com/kml/2.2','kml')
  kmlElement = kmlDoc.appendChild(kmlElement)
  documentElement = kmlDoc.createElement('Document')
  documentElement = kmlElement.appendChild(documentElement)

  for row in csvReader:
    placemarkElement = createPlacemark(kmlDoc,row)
    documentElement.appendChild(placemarkElement)

  kmlFile = open(fileName, "w")
  kmlFile.write(kmlDoc.toprettyxml('  ', newl='\n', encoding = 'utf-8'))

def createPlacemark(kmlDoc,row):
  # This creates a <Placemark> element for a row of data.
  # A row is a dict.
  
  placemarkElement = kmlDoc.createElement('Placemark')
  extElement = kmlDoc.createElement('ExtendedData')
  placemarkElement.appendChild(extElement)
  print row
  for key in row.keys():
    dataElement = kmlDoc.createElement('Data')
    dataElement.setAttribute('name',key)
    valueElement = kmlDoc.createElement('value')
    dataElement.appendChild(valueElement)
    valueText = kmlDoc.createTextNode(row[key])
    valueElement .appendChild(valueText)
    extElement.appendChild(dataElement)
  
  pointElement = kmlDoc.createElement('Point')
  placemarkElement.appendChild(pointElement)
  coordinates = geocoding2.geoCode(extractAddress(row))
  coorElement = kmlDoc.createElement('coordinates')
  coorElement.appendChild(kmlDoc.createTextNode(coordinates))
  pointElement.appendChild(coorElement)
  return placemarkElement

def extractAddress(row):
  return '%s,%s,%s,%s,%s' % (row['Address1'],row['Address2'],row['City'],row['State'],row['Zip'])

def main():
  

  # This reader opens up 'google-addresses.csv', which should be replaced with your own.
  # It creates a KML file called 'google.kml'.
  csvreader = csv.DictReader(open('google-addresses.csv'))
  kml = createKML(csvreader, 'google.kml')

if __name__ == '__main__':
  main()