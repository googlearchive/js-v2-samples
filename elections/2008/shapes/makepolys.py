#!/usr/bin/env python

# maketiles.py

#from geo import Geo
import math
import os
import random
import shutil
import stat
import sys
import time
import shpUtils

def loadshapefile( filename ):
	print 'Loading shapefile %s' % filename
	t1 = time.time()
	shapefile = shpUtils.loadShapefile( filename )
	t2 = time.time()
	print '%0.3f seconds load time' %( t2 - t1 )
	return shapefile
	
#def randomColor():
#	def hh(): return '%02X' %( random.random() *128 + 96 )
#	return hh() + hh() + hh()

featuresByName = {}
def featureByName( feature ):
	info = feature['info']
	name = info['NAME']
	if name not in featuresByName:
		featuresByName[name] = {
			'feature': feature #,
			#'color': randomColor()
		}
	return featuresByName[name]

def filterCONUS( features ):
	result = []
	for feature in features:
		shape = feature['shape']
		if shape['type'] != 5: continue
		info = feature['info']
		state = int(info['STATE'])
		if state == 2: continue  # Alaska
		if state == 15: continue  # Hawaii
		if state == 72: continue  # Puerto Rico
		result.append( feature )
	return result

#def featuresBounds( features ):
#	bounds = [ [ 180.0, 90.0 ], [ -180.0, -90.0 ] ]
#	for feature in features:
#		shape = feature['shape']
#		if shape['type'] == 5:
#			for part in shape['parts']:
#				bounds = geo.extendBounds( bounds, part['bounds'] )
#	return bounds

def writeFile( filename, data ):
	f = open( filename, 'wb' )
	f.write( data )
	f.close()

def generate( state, filename ):
	print '----------------------------------------'
	print 'Generating %s %s' %( state, filename )
	
	shapefile = loadshapefile( filename )
	features = shapefile['features']
	print '%d features' % len(features)
	
	#stateFeatures = filterCONUS( stateFeatures )
	#print '%d features in CONUS states' % len(stateFeatures)
	
	#writeFile( 'features.csv', shpUtils.dumpFeatureInfo(features) )
	
	nPoints = nPolys = 0
	places = {}
	for feature in features:
		shape = feature['shape']
		if shape['type'] != 5: continue
		info = feature['info']
		name = info['NAME']
		if name not in places:
			places[name] = { 'name': name, 'shapes': [] }
		shapes = places[name]['shapes']
		for part in shape['parts']:
			nPolys += 1
			points = part['points']
			n = len(points) - 1
			nPoints += n
			pts = []
			area = part['area']
			bounds = part['bounds']
			center = part['center']
			centroid = part['centroid']
			points = part['points']
			for j in xrange(n):
				point = points[j]
				pts.append( '[%s,%s]' %( point[0], point[1] ) )
			shapes.append( '{area:%.8f,bounds:[[%.8f,%.8f],[%.8f,%.8f]],center:[%.8f,%.8f],centroid:[%.8f,%.8f],points:[%s]}' %(
				area,
				bounds[0][0], bounds[0][1], 
				bounds[1][0], bounds[1][1], 
				center[0], center[1],
				centroid[0], centroid[1],
				','.join(pts)
			) )
	json = []
	names = places.keys()
	names.sort()
	for name in names:
		json.append( '{name:"%s",shapes:[%s]}' %(
			#reader.fixCountyName( name ),
			name,
			','.join(places[name]['shapes'])
		) )
	print '%d points in %d places' %( nPoints, len(places) )
	writeFile( 'data.js', '''
Data = {
	places: [%s]
};
''' %( ','.join(json) ) )

generate( None, 'states/st99_d00_shp-75/st99_d00.shp' )

print 'Done!'
