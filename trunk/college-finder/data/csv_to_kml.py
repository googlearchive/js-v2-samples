"""
Currently, the Maps Data API only supports importing data as KML, so this script
converts the CSV college data to a KML file.  You can upload a KML file to My Maps
by going to http://maps.google.com/maps/mm, clicking 'Create new map' and then 'Import',
after which you can use the Maps Data API to access the map.

When we allow direct CSV uploads to the Maps Data API in the near future, converting
CSV to KML will no longer be necessary.
"""


import os
import sys
import csv
import time
import urllib
import xml.dom.minidom

USAGE = 'Usage: python %s <csv_input_filename> <kml_output_filename>' % os.path.basename(__file__)

MAPS_API_KEY = 'ABQIAAAAAXRHBzvcYZkkEqRaBgXApxRVxhLeBhMD54-1xBmv7u9irWOHFRS9wQwnbtAF-EiES-FsXYAfX_SMHw'
GEOCODER_URL = 'http://maps.google.com/maps/geo?q=%s&output=csv&key=' + MAPS_API_KEY


def geocode(address):
    """Geocodes the given address using the Google Maps API HTTP geocoder,
    and returns the longitude,latitude as a string."""
    url = GEOCODER_URL % urllib.quote(address)
    (status, accuracy, lat, lng) = urllib.urlopen(url).read().split(',')
    
    if status == '200':
        return '%s,%s' % (lng, lat)
    else:
        print '  ERROR: Geocoding failed for address %s (status %s)' % (address, status)
        return None


def create_placemark_element(kml_doc, name, description, coordinates, extended_data={}):
    """Create a KML Point placemark using a given name, description, and lng/lat coordinates.
    If any text key/value pairs are specified as extended_data,
    they are added as KML ExtendedData tags.  The Placemark is returned as a DOM element
    for the given kml_doc XML DOM Document."""
    
    # Create <Placemark>
    placemark_element = kml_doc.createElement('Placemark')
    
    # Add <name>
    name_element = kml_doc.createElement('name')
    name_element.appendChild(kml_doc.createTextNode(name))
    placemark_element.appendChild(name_element)
    
    # Add <description>
    if description:
        description_element = kml_doc.createElement('description')
        description_element.appendChild(kml_doc.createTextNode(description))
        placemark_element.appendChild(description_element)
    
    # Add <ExtendedData>
    if len(extended_data) > 0:
        extended_data_element = kml_doc.createElement('ExtendedData')
        placemark_element.appendChild(extended_data_element)
        for name in sorted(extended_data):
            value = extended_data[name]
            data_element = kml_doc.createElement('Data')
            data_element.setAttribute('name', name)
            value_element = kml_doc.createElement('value')
            value_element.appendChild(kml_doc.createTextNode(value))
            data_element.appendChild(value_element)
            extended_data_element.appendChild(data_element)
    
    # Add <Point>
    point_element = kml_doc.createElement('Point')
    coordinates_element = kml_doc.createElement("coordinates")
    coordinates_element.appendChild(kml_doc.createTextNode(coordinates))
    point_element.appendChild(coordinates_element)
    placemark_element.appendChild(point_element)
    
    return placemark_element


def create_kml_document(document_name, csv_input_filename, kml_output_filename, modify_row_dict=None):
    """Create a KML document from a CSV file.  Each CSV row is read into a dictionary, which
    can be optionally modified by a given modify_row_dict function before being converted to
    a KML placemark."""
    
    # Open the input/output files
    if os.path.isfile(csv_input_filename):
        csv_input_file  = open(csv_input_filename, 'r')
        kml_output_file = open(kml_output_filename, 'w')
    else:
        sys.exit("Invalid file name: %s" % csv_input_filename)
    
    # Create the KML document and <kml> element.
    kml_doc = xml.dom.minidom.Document()
    kml_element = kml_doc.createElement('kml')
    kml_element.setAttribute('xmlns', 'http://www.opengis.net/kml/2.2')
    kml_element = kml_doc.appendChild(kml_element)
    
    # Add <Document>
    document_element = kml_doc.createElement('Document')
    document_element = kml_element.appendChild(document_element)
    
    # Add document <name>
    name_element = kml_doc.createElement('name')
    name_element.appendChild(kml_doc.createTextNode(document_name))
    document_element.appendChild(name_element)
    
    # Read each CSV row into a dictionary, optionally modify the dictionary,
    # and use it to create a Placemark that is appended to the KML Document element.
    reader = csv.DictReader(csv_input_file)
    for line_num, row in enumerate(reader):
        # If a modify_row_dict function was given, apply it to the dictionary for each row.
        if modify_row_dict:
            modify_row_dict(row)
        
        # Check that this row has all required fields.
        standard_fields = ['name', 'address', 'description']
        required_fields = ['name', 'address']
        for field in required_fields:
            if not field in row or not row[field]:
                raise Exception('Line %d is missing a required field: %s' % (line_num + 1, field))
        
        name        = row.get('name')
        address     = row.get('address')
        description = row.get('description', None)
        coordinates = geocode(address)
        
        # Add any non-required fields as extended data.
        extended_data = {}
        for field in row:
            if not field in standard_fields:
                extended_data[field] = row[field]
        
        # Delay for a moment to avoid exceeding geocoder quota.
        time.sleep(0.05)
        
        if coordinates != None:
            print 'Adding Placemark: %s' % name
            placemark_element = create_placemark_element(kml_doc, name, description, coordinates, extended_data)
            document_element.appendChild(placemark_element)
    
    # Write the KML document to the output file, formatted as pretty XML.
    csv_input_file.close()
    kml_output_file.write(kml_doc.toprettyxml('  '))
    kml_output_file.close()


if __name__ == '__main__':
    # Get the input/output filenames from the command line.
    if len(sys.argv) == 3:
        csv_input_filename  = sys.argv[1]
        kml_output_filename = sys.argv[2]
    else:
        sys.exit(USAGE)
    
    def modify_row_dict(row):
        """Modify a single row of CSV college data before it's converted to KML."""
        
        # Use 3 Type values: Public, Private, or Unknown
        school_type = row['Type']
        if 'Public' in school_type:
            school_type = 'Public'
        elif 'Private' in school_type:
            school_type = 'Private'
        else:
            raise Exception('Unknown school type')
        
        # Group counts of student population into buckets
        try:
            size = int(row['Size'])
            if size < 100:
                size = 'less than 100'
            elif size < 1000:
                size = '100 to 1K'
            elif size < 10000:
                size = '1K to 10K'
            else:
                size = 'more than 10K'
        except:
            size = 'Unknown'
        
        row['Address'] = row['address']
        row['Type'] = school_type
        row['Size'] = size
        row['Website'] = row['Website'].lower()
    
    create_kml_document("4-Year U.S. Colleges", csv_input_filename, kml_output_filename, modify_row_dict)