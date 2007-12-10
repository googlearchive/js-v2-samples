import urllib
import xml.dom.minidom

def geocode(address):
  # This function queries the Google Maps API geocoder with an
  # address. It gets back a csv file, which it then parses and
  # returns a string with the longitude and latitude of the address.

  # This isn't an actual maps key, you'll have to get one yourself.
  # Sign up for one here: http://code.google.com/apis/maps/signup.html
  mapsKey = 'abcdefgh'
  mapsUrl = 'http://maps.google.com/maps/geo?q='
     
  # This joins the parts of the URL together into one string.
  url = ''.join([mapsUrl,urllib.quote(address),'&output=csv&key=',mapsKey])
    
  # This retrieves the URL from Google.
  coordinates = urllib.urlopen(url).read().split(',')
    
  # This parses out the longitude and latitude, and then combines them into a string.
  coorText = '%s,%s' % (coordinates[3],coordinates[2])

  return coorText

def createKML(address, fileName):
  # This function creates an XML document and adds the necessary
  # KML elements.

  kmlDoc = xml.dom.minidom.Document()
  
  kmlElement = kmlDoc.createElementNS('http://earth.google.com/kml/2.2','kml')

  kmlElement = kmlDoc.appendChild(kmlElement)

  documentElement = kmlDoc.createElement('Document')
  documentElement = kmlElement.appendChild(documentElement)

  placemarkElement = kmlDoc.createElement('Placemark')
  
  descriptionElement = kmlDoc.createElement('description')
  descriptionText = kmlDoc.createTextNode(address)
  descriptionElement.appendChild(descriptionText)
  placemarkElement.appendChild(descriptionElement)
  pointElement = kmlDoc.createElement('Point')
  placemarkElement.appendChild(pointElement)
  coorElement = kmlDoc.createElement('coordinates')

  # This geocodes the address and adds it to a <Point> element.
  coordinates = geocode(address)
  coorElement.appendChild(kmlDoc.createTextNode(coordinates))
  pointElement.appendChild(coorElement)

  documentElement.appendChild(placemarkElement)

  # This writes the KML Document to a file.
  kmlFile = open(fileName, 'w')
  kmlFile.write(kmlDoc.toprettyxml(' '))  
  kmlFile.close()
  
if __name__ == '__main__':
  createKML('1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA', 'google.kml')