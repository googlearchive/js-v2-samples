#!/usr/bin/env python

# maketiles.py

import coords
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

featureColors = {}
def featureColor( feature ):
	info = feature['info']
	name = info['NAME']
	if name not in featureColors:
		featureColors[name] = randomColor()
	return featureColors[name]

def generate( filename, zoom ):
	shapefile = loadshapefile( filename )
	t1 = time.time()
	
	scale = 10
	draw = '''
	stroke-width 10
	scale .1,.1
	'''
	
	nPolys = nPoints = 0
	features = shapefile['features']
	print '%d features' % len(features)
	#for feature in features:
	for i in xrange(len(features)):
		feature = features[i]
		shape = feature['shape']
		if shape['type'] != 5: continue
		color = featureColor( feature )
		info = feature['info']
		name = info['NAME']
		#print 'Feature %d: %s' %( i, name )
		for part in shape['parts']:
			nPolys += 1
			draw += '''
	fill  #%sA0
	stroke #80808040
	polygon''' % randomColor()
			points = part['points']
			n = len(points) - 1
			nPoints += n
			for j in xrange(n):
				point = coords.geoToPixel( points[j], zoom, 256*scale )
				draw += ' %d,%d' %( point[0], point[1] )
	print '%d points in %d polygons' %( nPoints, nPolys )
	f = open( 'draw.cmd', 'wb' )
	f.write( draw )
	f.close()
	
	t2 = time.time()
	print '%0.3f seconds to generate commands' %( t2 - t1 )
	
	print 'Calling convert'
	t1 = time.time()
	dim = 256 * ( 1 << zoom )
	#os.system( 'convert null: -resize %dx%d -draw "@draw.cmd" -crop 256x256 tile.png' %( dim, dim )
	os.system( 'convert null: -resize %dx%d -draw "@draw.cmd" tile.png' %( dim, dim ) )
	t2 = time.time()
	print '%0.3f seconds to generate graphics' %( t2 - t1 )

#generate( 'states/st99_d00_shp-25/st99_d00.shp', 3 )
generate( 'counties/co99_d00_shp-60/co99_d00.shp', 3 )

print 'Done!'