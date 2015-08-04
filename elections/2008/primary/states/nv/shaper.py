#!/usr/bin/env python

iconBaseUrl = 'http://googlemaps.github.io/js-v2-samples/elections/2008/images/icons/'

import private
import os
import reader
import elementtree.ElementTree as ET
import simplejson as sj
import random

#def str( text ):
#	strings = {
#		'county': 'town',
#		'counties': 'towns'
#	}
#	return strings[text] or text

def randomColor():
	def hh(): return '%02X' %( random.random() *256 )
	return hh() + hh() + hh()

def getData( earth=False ):
	filename = 'co32_d00_shp' + ['-72',''][earth] + '/co32_d00.gpx'
	print 'Reading %s...' % filename
	xmlRoot = ET.parse( filename )
	counties = {}
	for xmlCounty in xmlRoot.getiterator('rte'):
		name = xmlCounty.findtext('name').strip()
		number = xmlCounty.findtext('number').strip()
		#print '%s County' % name
		## Correct error in census data for Wentworth's Location
		#if( name == "Wentworth" and number == '9' ):
		#	name = "Wentworth's Location"
		if name not in counties:
			county = {
				'name': name,
				'shapes': [],
				'largest': [ 0, 0 ]
			}
			counties[name] = county
		points = []
		def attr( pt, key ): return float( pt.attrib[key].strip() )
		for xmlPoint in xmlCounty.getiterator('rtept'):
			points.append( [ attr(xmlPoint,'lat'), attr(xmlPoint,'lon') ] )
		county = counties[name]
		county['shapes'].append( polyInfo( points ) )
	return { 'state':{}, 'counties':counties }

def makeKML( earth=False ):
	def make( party ):
		data = getData( earth )
		reader.readVotes( data, party )
		writeKML( earth, data['counties'], party )
	make( 'democrat' )
	make( 'republican' )

def writeKML( earth, counties, party ):
	print 'Writing ' + party
	kml = ET.Element( 'kml', { 'xmlns':'http://earth.google.com/kml/2.0' } )
	kmlDocument = ET.SubElement( kml, 'Document' )
	kmlDocumentLookAt = ET.SubElement( kmlDocument, 'LookAt' )
	kmlDocumentLookAtLatitude = ET.SubElement( kmlDocumentLookAt, 'latitude' )
	kmlDocumentLookAtLatitude.text = '43.5'
	kmlDocumentLookAtLongitude = ET.SubElement( kmlDocumentLookAt, 'longitude' )
	kmlDocumentLookAtLongitude.text = '-71.7'
	kmlDocumentLookAtRange = ET.SubElement( kmlDocumentLookAt, 'range' )
	kmlDocumentLookAtRange.text = '200000'
	kmlDocumentLookAtTilt = ET.SubElement( kmlDocumentLookAt, 'tilt' )
	kmlDocumentLookAtTilt.text = '55'
	kmlDocumentName = ET.SubElement( kmlDocument, 'name' )
	kmlDocumentName.text = 'Michigan ' + partyName(party) + ' Primary'
	kmlFolder = ET.SubElement( kmlDocument, 'Folder' )
	kmlFolderName = ET.SubElement( kmlFolder, 'name' )
	kmlFolderName.text = 'Michigan Counties'
	for name, county in counties.iteritems():
		kmlPlacemark = ET.SubElement( kmlFolder, 'Placemark' )
		#kmlPlaceName = ET.SubElement( kmlPlacemark, 'name' )
		#kmlPlaceName.text = name
		kmlMultiGeometry = ET.SubElement( kmlPlacemark, 'MultiGeometry' )
		if earth:
			kmlPoint = ET.SubElement( kmlMultiGeometry, 'Point' )
			kmlPointCoordinates = ET.SubElement( kmlPoint, 'coordinates' )
			kmlPointCoordinates.text = coord( county['centroid'] )
		kmlPolygon = ET.SubElement( kmlMultiGeometry, 'Polygon' )
		kmlOuterBoundaryIs = ET.SubElement( kmlPolygon, 'outerBoundaryIs' )
		kmlLinearRing = ET.SubElement( kmlOuterBoundaryIs, 'LinearRing' )
		kmlCoordinates = ET.SubElement( kmlLinearRing, 'coordinates' )
		kmlCoordinates.text = ' '.join([ coord(point) for point in county['points'] ])
		kmlStyle = ET.SubElement( kmlPlacemark, 'Style' )
		if earth:
			kmlIconStyle = ET.SubElement( kmlStyle, 'IconStyle' )
			kmlIcon = ET.SubElement( kmlIconStyle, 'Icon' )
			kmlIconHref = ET.SubElement( kmlIcon, 'href' )
			leader = getLeader(county,party) or { 'name': 'generic' }
			kmlIconHref.text = iconBaseUrl + leader['name'] + '-border.png'
			kmlBalloonStyle = ET.SubElement( kmlStyle, 'BalloonStyle' )
			kmlBalloonText = ET.SubElement( kmlBalloonStyle, 'text' )
			kmlBalloonText.text = htmlBalloon( county, party )
		kmlLineStyle = ET.SubElement( kmlStyle, 'LineStyle' )
		kmlLineStyleColor = ET.SubElement( kmlLineStyle, 'color' )
		kmlLineStyleColor.text = '40000000'
		kmlLineStyleWidth = ET.SubElement( kmlLineStyle, 'width' )
		kmlLineStyleWidth.text = '1'
		kmlPolyStyle = ET.SubElement( kmlStyle, 'PolyStyle' )
		kmlPolyStyleColor = ET.SubElement( kmlPolyStyle, 'color' )
		kmlPolyStyleColor.text = getColor( county, party )
	
	kmlTree = ET.ElementTree( kml )
	kmlfile = open( private.targetKML + ['maps','earth'][earth] + '-mi-' + party + '.kml', 'w' )
	kmlfile.write( '<?xml version="1.0" encoding="utf-8" ?>\n' )
	kmlTree.write( kmlfile )
	kmlfile.close()

def makeData():
	data = getData()
	state = data['state']
	counties = data['counties']
	
	ctyNames = []
	for name in counties:
		ctyNames.append( name )
	ctyNames.sort()
	#for name in ctyNames:
	#	print name
	
	nPoints = 0
	ctys = []
	for name in ctyNames:
		county = counties[name]
		shapes = []
		#for point in county['points']:
		#	pts.append( '[%s,%s]' %( point[0], point[1] ) )
		#ctys.append( '{name:"%s",centroid:[%.8f,%.8f],points:[%s]}' %(
		#	county['name'],
		#	','.join(pts)
		#) )
		#centroid = county['centroid']
		for shape in county['shapes']:
			pts = []
			area = shape['area']
			bounds = shape['bounds']
			center = shape['center']
			centroid = shape['centroid']
			points = shape['points']
			size = shape['size']
			for point in points:
				nPoints += 1
				# TODO: refactor all this point formatting
				pts.append( '[%s,%s]' %( point[0], point[1] ) )
			shapes.append( '{area:%.8f,bounds:[[%.8f,%.8f],[%.8f,%.8f]],size:[%.8f,%.8f],center:[%.8f,%.8f],centroid:[%.8f,%.8f],points:[%s]}' %(
				area,
				bounds[0][0], bounds[0][1], 
				bounds[1][0], bounds[1][1], 
				size[0], size[1],
				center[0], center[1],
				centroid[0], centroid[1],
				','.join(pts)
			) )
		ctys.append( '{name:"%s",shapes:[%s]}' %(
			reader.fixCountyName( name ),
			','.join(shapes)
		) )
	
	print '%d points in %d places' %( nPoints, len(ctys) )
	write( 'data.js', '''
Data = {
	counties: [%s]
};
''' %( ','.join(ctys) ) )

def makeJson( party ):
	data = getData()
	reader.readVotes( data, party )
	state = data['state']
	counties = data['counties']
	for county in counties.itervalues():
		#del county['centroid']
		del county['shapes']
	
	result = {
		'status': 'ok',
		'state': state,
		'counties': counties
	}
	
	write(
		'results_%s.js' % party,
		'Json.%sResults(%s)' %( party, json(result) )
	)
	
	print '%s of %s precincts reporting' %( state['precincts']['reporting'], state['precincts']['total'] )
	
def coord( point ):
	return str(point[1]) + ',' + str(point[0]) + ',0'

def getColor( county, party ):
	leader = getLeader( county, party )
	if not leader:
		return '00000000';
	else:
		return 'C0' + bgr( leader['color'] )

def getLeader( county, party ):
	tally = county.get(party)
	if tally == None  or  len(tally) == 0:
		return None
	return reader.candidates['byname'][party][ tally[0]['name'] ]

def bgr( rgb ):
	return rgb[5:7] + rgb[3:5] + rgb[1:3]

def htmlBalloon( county, party ):
	return '''
<div style="font-weight:bold;">
	%s County, MI
</div>
<div>
	2008 %s Primary
</div>
<table>
	%s
</table>
''' %(
	county['name'],
	partyName( party ),
	htmlBalloonTally( county, party )
)

def htmlBalloonTally( county, party ):
	tally = county.get(party)
	if tally == None  or  len(tally) == 0:
		return '<tr><td>No votes reported</td></tr>'
	return ''.join([ htmlBalloonTallyRow(party,who) for who in tally ])

def htmlBalloonTallyRow( party, who ):
	candidate = reader.candidates['byname'][party][ who['name'] ]
	return '''
		<tr>
			<td style="text-align:right; width:1%%;">
				<div style="margin-right:4px;">
					%s
				</div>
			</td>
			<td style="width:1%%">
				<div style="height:18px; width:18px; border:1px solid #888888; background-color:%s; margin-right:4px;">
					&nbsp;
				</div>
			</td>
			<td style="width:1%%;">
				<img style="height:16px; width:16px; margin: 1px 4px 1px 1px;" src="%s" />
			</td>
			<td>
				<div>
					%s
				</div>
			</td>
		</tr>
''' %(
	formatNumber( who['votes'] ),
	candidate['color'],
	iconBaseUrl + who['name'] + '-border.png',
	candidate['fullName']
)

def partyName( party ):
	return { 'democrat':'Democratic', 'republican':'Republican' }[ party ]

def formatNumber( number ):
	return str(number)

# Get multiple pieces of info about a polygon
# See related code:
# http://local.wasp.uwa.edu.au/~pbourke/geometry/polyarea/
# http://www.efg2.com/Lab/Graphics/PolygonArea.htm
# http://tog.acm.org/GraphicsGems/gemsiv/centroid.c

def polyInfo( points ):
	n = len(points)
	if n < 3: return None
	area = cx = cy = 0
	minX = minY = 360
	maxX = maxY = -360
	pt = points[n-1];  xx = pt[0];  yy = pt[1]
	for pt in points:
		x = pt[0];  y = pt[1]
		# bounds
		minX = min( x, minX );  minY = min( y, minY )
		maxX = max( x, maxX );  maxY = max( y, maxY )
		# area and centroid
		a = xx * y - x * yy
		area += a
		cx += ( x + xx ) * a
		cy += ( y + yy ) * a
		# next
		xx = x;  yy = y
	area /= 2
	if area == 0: return None
	return {
		'area': area,
		'bounds': [ [ minX, minY ], [ maxX, maxY ] ],
		'center': [ ( minX + maxX ) / 2, ( minY + maxY ) / 2 ],
		'centroid': [ cx / area / 6, cy / area / 6 ],
		'points': points,
		'size': [ maxX - minX, maxY - minY ]
	}

def json( obj ):
	#return sj.dumps( obj, indent=4 )
	return sj.dumps( obj, separators=( ',', ':' ) )

def write( name, text ):
	print 'Writing ' + name
	f = open( name, 'w' )
	f.write( text )
	f.close()

def main():
	print 'Retrieving data...'
	reader.fetchData()
	#print 'Creating Earth KML...'
	#makeKML( True )
	print 'Creating data.js...'
	makeData()
	print 'Creating Maps JSON...'
	makeJson( 'democrat' )
	makeJson( 'republican' )
	print 'Checking in Maps JSON...'
	os.system( 'svn ci -m "Vote update" nv_text_output_for_mapping.csv data.js results_democrat.js results_republican.js' )
	print 'Done!'

if __name__ == "__main__":
    main()
