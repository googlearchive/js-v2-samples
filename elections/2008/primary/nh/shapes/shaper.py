#!/usr/bin/env python

#import sys
#print sys.version

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
	return '%02X' %( random.random() *128 + 64 )

def fixCountyName( name ):
	name = name.strip()
	fixNames = {
	}
	if( name in fixNames ):
		name = fixNames[name]
	return name

def makeCounties():
	xmlRoot = ET.parse( 'cs33_d00_shp-94/cs33_d00.gpx' )
	
	nPoints = 0
	counties = {}
	kml = ET.Element( 'kml', { 'xmlns':'http://earth.google.com/kml/2.0' } )
	kmlDocument = ET.SubElement( kml, 'Document' )
	kmlFolder = ET.SubElement( kmlDocument, 'Folder' )
	kmlFolderName = ET.SubElement( kmlFolder, 'name' )
	kmlFolderName.text = 'New Hampshire Towns'
	
	for xmlCounty in xmlRoot.getiterator('rte'):
		points = []
		for xmlPoint in xmlCounty.getiterator('rtept'):
			points.append( [ xmlPoint.attrib['lat'].strip(), xmlPoint.attrib['lon'].strip() ] )
		name = xmlCounty.findtext('name').strip()
		county = {
			'name': name,
			'points': points,
			'centroid': polyCentroid( points )
		}
		counties[name] = county
		kmlPlacemark = ET.SubElement( kmlFolder, 'Placemark' )
		kmlPlaceName = ET.SubElement( kmlPlacemark, 'name' )
		kmlPlaceName.text = name
		kmlPolygon = ET.SubElement( kmlPlacemark, 'Polygon' )
		kmlOuterBoundaryIs = ET.SubElement( kmlPolygon, 'outerBoundaryIs' )
		kmlLinearRing = ET.SubElement( kmlOuterBoundaryIs, 'LinearRing' )
		kmlCoordinates = ET.SubElement( kmlLinearRing, 'coordinates' )
		kmlCoordinates.text = ' '.join([ point[1] + ',' + point[0] + ',0' for point in points ])
		kmlStyle = ET.SubElement( kmlPlacemark, 'Style' )
		kmlLineStyle = ET.SubElement( kmlStyle, 'LineStyle' )
		kmlLineStyleColor = ET.SubElement( kmlLineStyle, 'color' )
		kmlLineStyleColor.text = '40000000'
		kmlLineStyleWidth = ET.SubElement( kmlLineStyle, 'width' )
		kmlLineStyleWidth.text = '1'
		kmlPolyStyle = ET.SubElement( kmlStyle, 'PolyStyle' )
		kmlPolyStyleColor = ET.SubElement( kmlPolyStyle, 'color' )
		kmlPolyStyleColor.text = '80' + randomColor()
	
	kmlTree = ET.ElementTree( kml )
	kmlfile = open( 'G:/domains/mg.to/web/public/nh/test.kml', 'w' )
	kmlfile.write( '<?xml version="1.0" encoding="utf-8" ?>\n' )
	kmlTree.write( kmlfile )
	kmlfile.close()
	
	ctyNames = []
	for name in counties:
		ctyNames.append( name )
	ctyNames.sort()
	for name in ctyNames:
		print name
	
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
			fixCountyName( county['name'] ),
			centroid[0], centroid[1],
			','.join(pts)
		) )
	
	print '%d points in %d places' %( nPoints, len(ctys) )
	return '[%s]' % ','.join(ctys)

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

def write( name, text ):
	f = open( name, 'w' )
	f.write( text )
	f.close()

def main():
	print 'Starting...'
	write( '../data.js', '''
Data = {
	counties: %s
};
''' %( makeCounties() ) )
	print 'Done!'

if __name__ == "__main__":
    main()
