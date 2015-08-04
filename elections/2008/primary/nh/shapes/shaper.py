#!/usr/bin/env python

iconBaseUrl = 'http://googlemaps.github.io/js-v2-samples/elections/2008/images/icons/'

import private
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
	return hh() + hh() + hh()

def hh():
	return '%02X' %( random.random() *256 )

def getData( earth=False ):
	filename = 'cs33_d00_shp' + ['-94',''][earth] + '/cs33_d00.gpx'
	print 'Reading %s...' % filename
	xmlRoot = ET.parse( filename )
	counties = {}
	for xmlCounty in xmlRoot.getiterator('rte'):
		points = []
		for xmlPoint in xmlCounty.getiterator('rtept'):
			points.append( [ xmlPoint.attrib['lat'].strip(), xmlPoint.attrib['lon'].strip() ] )
		name = xmlCounty.findtext('name').strip()
		number = xmlCounty.findtext('number').strip()
		# Correct error in census data for Wentworth's Location
		if( name == "Wentworth" and number == '9' ):
			name = "Wentworth's Location"
		county = {
			'name': name,
			'points': points,
			'centroid': polyCentroid( points )
		}
		counties[name] = county
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
	kmlDocumentName.text = 'New Hampshire ' + partyName(party) + ' Primary'
	kmlFolder = ET.SubElement( kmlDocument, 'Folder' )
	kmlFolderName = ET.SubElement( kmlFolder, 'name' )
	kmlFolderName.text = 'New Hampshire Towns'
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
	kmlfile = open( private.targetKML + ['maps','earth'][earth] + '-nh-' + party + '.kml', 'w' )
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
		pts = []
		#for point in county['points']:
		#	pts.append( '[%s,%s]' %( point[0], point[1] ) )
		#ctys.append( '{name:"%s",centroid:[%.8f,%.8f],points:[%s]}' %(
		#	county['name'],
		#	','.join(pts)
		#) )
		pts = []
		#lats = lons = 0
		minLat = minLon = 360
		maxLat = maxLon = -360
		centroid = county['centroid']
		points = county['points']
		for point in points:
			nPoints += 1
			pts.append( '[%s,%s]' %( point[0], point[1] ) )
		ctys.append( '{name:"%s",centroid:[%.8f,%.8f],points:[%s]}' %(
			reader.fixCountyName( name ),
			centroid[0], centroid[1],
			','.join(pts)
		) )
	
	print '%d points in %d places' %( nPoints, len(ctys) )
	write( '../data.js', '''
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
		del county['centroid']
		del county['points']
	
	result = {
		'status': 'ok',
		'state': state,
		'counties': counties
	}
	
	write(
		'../results_%s.js' % party,
		'Json.%sResults(%s)' %( party, json(result) )
	)

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
	%s, NH
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

# Port of ANSI C code from the article
# "Centroid of a Polygon"
# by Gerard Bashein and Paul R. Detmer,
# (gb@locke.hs.washington.edu, pdetmer@u.washington.edu)
# in "Graphics Gems IV", Academic Press, 1994
# http://tog.acm.org/GraphicsGems/gemsiv/centroid.c
def polyCentroid( points ):
	def fix( pt ): return [ float(pt[0]), float(pt[1]) ]
	n = len(points)
	atmp = xtmp = ytmp = 0
	if n < 3: return []
	pI = fix( points[n-1] )
	for j in xrange( 0, n ):
		pJ = fix( points[j] )
		ai = pI[0] * pJ[1] - pJ[0] * pI[1]
		atmp += ai
		xtmp += ( pJ[0] + pI[0] ) * ai
		ytmp += ( pJ[1] + pI[1] ) * ai;
		pI = pJ
	area = atmp / 2;
	if atmp == 0: return []
	return [ xtmp / (3 * atmp), ytmp / (3 * atmp) ]

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
	#print 'Creating Maps KML...'
	#makeKML( False )
	print 'Creating Earth KML...'
	makeKML( True )
	print 'Creating JSON...'
	makeJson( 'democrat' )
	makeJson( 'republican' )
	print 'Creating data.js...'
	makeData()
	print 'Done!'

if __name__ == "__main__":
    main()
