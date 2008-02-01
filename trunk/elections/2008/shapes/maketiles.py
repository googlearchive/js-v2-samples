#!/usr/bin/env python

# maketiles.py

from geo import Geo
import math
import os
import random
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
	
def randomColor():
	def hh(): return '%02X' %( random.random() *128 + 96 )
	return hh() + hh() + hh()

featuresByName = {}
def featureByName( feature ):
	info = feature['info']
	name = info['NAME']
	if name not in featuresByName:
		featuresByName[name] = {
			'feature': feature,
			'color': randomColor()
		}
	return featuresByName[name]

def filterCONUS( features ):
	result = []
	for feature in features:
		shape = feature['shape']
		if shape['type'] != 5: continue
		info = feature['info']
		name = info['NAME']
		if name == 'Alaska': continue
		if name == 'Hawaii': continue
		if name == 'Puerto Rico': continue
		result.append( feature )
	return result

def featuresBounds( features ):
	bounds = [ [ 180.0, 90.0 ], [ -180.0, -90.0 ] ]
	for feature in features:
		for part in feature['shape']['parts']:
			bounds = geo.extendBounds( bounds, part['bounds'] )
	return bounds

def generate( filename, zoom ):
	print 'Generating %s zoom %d' %( filename, zoom )
	scale = 10
	draw = '''
stroke-width 10
scale .1,.1
	'''
	global geo
	geo = Geo( zoom, 256*scale )
	pixgeo = Geo( zoom, 256 )
	shapefile = loadshapefile( filename )
	t1 = time.time()
	
	nPolys = nPoints = 0
	features = shapefile['features']
	print '%d features' % len(features)
	
	features = filterCONUS( features )
	print '%d features in CONUS' % len(features)
	#outer = pixgeo.pixFromGeoBounds( featuresBounds(features) )
	fb = featuresBounds( features )
	outer = pixgeo.pixFromGeoBounds( fb )
	outer = pixgeo.inflateBounds( outer, 8 )
	offset, tilebounds = pixgeo.tileBounds( outer )
	scaleoffset = pixgeo.scalePoint( offset, scale )
	print 'Offset:[%d,%d], Size:[%d,%d]' %( offset[0], offset[1], tilebounds[1][0], tilebounds[1][1] )
	
	#for feature in features:
	for i in xrange(len(features)):
		feature = features[i]
		color = featureByName( feature )['color']
		#print 'Feature %d: %s' %( i, name )
		for part in feature['shape']['parts']:
			nPolys += 1
			draw += '''
fill  #%sA0
stroke #00000080
polygon''' % randomColor()
#			draw += '''
#fill  #00000000
#stroke #00000080
#polygon'''
			points = part['points']
			n = len(points) - 1
			nPoints += n
			for j in xrange(n):
				point = geo.pixFromGeoPoint( points[j] )
				draw += ' %d,%d' %( point[0] - scaleoffset[0], point[1] - scaleoffset[1] )
	print '%d points in %d polygons' %( nPoints, nPolys )
	
	f = open( 'draw.cmd', 'wb' )
	f.write( draw )
	f.close()
	
	t2 = time.time()
	print '%0.3f seconds to generate commands' %( t2 - t1 )
	
	t1 = time.time()
	#os.system( 'convert null: -resize %dx%d -draw "@draw.cmd" -crop 256x256 tile.png' %( dim, dim ) )
	command = 'convert null: -resize %dx%d! -draw "@draw.cmd" tile%d.png' %( tilebounds[1][0], tilebounds[1][1], zoom )
	print command
	os.system( command )
	t2 = time.time()
	print '%0.3f seconds to generate graphics' %( t2 - t1 )

for z in xrange(9):
	generate( 'states/st99_d00_shp-25/st99_d00.shp', z )
#generate( 'counties/co99_d00_shp-60/co99_d00.shp', 2 )
#generate( '../primary/states/mi/co26_d00_shp-82/co26_d00.shp', 5 )

print 'Done!'
