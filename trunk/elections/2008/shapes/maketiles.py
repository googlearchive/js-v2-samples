#!/usr/bin/env python

# maketiles.py

from geo import Geo
import magick
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
		state = int(info['STATE'])
		if state == 2: continue  # Alaska
		if state == 15: continue  # Hawaii
		if state == 72: continue  # Puerto Rico
		result.append( feature )
	return result

def featuresBounds( features ):
	bounds = [ [ 180.0, 90.0 ], [ -180.0, -90.0 ] ]
	for feature in features:
		shape = feature['shape']
		if shape['type'] == 5:
			for part in shape['parts']:
				bounds = geo.extendBounds( bounds, part['bounds'] )
	return bounds

def writeFile( filename, data ):
	f = open( filename, 'wb' )
	f.write( data )
	f.close()

def generate( state, stateFilename, countyFilename, path, zoom ):
	global geo, scaleoffset
	print '----------------------------------------'
	print 'Generating %s %s zoom %d' %( stateFilename, countyFilename, zoom )
	scale = 10
	
	geo = Geo( zoom, 256*scale )
	pixgeo = Geo( zoom, 256 )
	stateShapefile = loadshapefile( stateFilename )
	
	t1 = time.time()
	
	stateFeatures = stateShapefile['features']
	print '%d state features' % len(stateFeatures)
	
	stateFeatures = filterCONUS( stateFeatures )
	print '%d features in CONUS states' % len(stateFeatures)
	
	#writeFile( 'features.csv', shpUtils.dumpFeatureInfo(features) )
	
	#outer = pixgeo.pixFromGeoBounds( featuresBounds(features) )
	fb = featuresBounds( stateFeatures )
	outer = pixgeo.pixFromGeoBounds( fb )
	outer = pixgeo.inflateBounds( outer, 8 )
	gridoffset, gridsize = pixgeo.tileBounds( outer )
	scaleoffset = pixgeo.scalePoint( gridoffset, scale )
	print 'Offset:[%d,%d], Size:[%d,%d]' %( gridoffset[0], gridoffset[1], gridsize[0], gridsize[1] )

	draw = [ 'scale .1,.1\n' ]
	
	if countyFilename:
		countyShapefile = loadshapefile( countyFilename )
		countyFeatures = countyShapefile['features']
		print '%d county features' % len(countyFeatures)
		
		countyFeatures = filterCONUS( countyFeatures )
		print '%d features in CONUS counties' % len(countyFeatures)
		
		draw.append( 'stroke-width 10\n' )
		drawFeatures( draw, countyFeatures, getRandomColor )
		
		draw.append( 'stroke-width 20\n' )
		drawFeatures( draw, stateFeatures, None )
	else:
		draw.append( 'stroke-width 10\n' )
		drawFeatures( draw, stateFeatures, getRandomColor )
					 
	writeFile( 'draw.cmd', ''.join(draw) )
	
	t2 = time.time()
	print '%0.3f seconds to generate commands' %( t2 - t1 )
	
	crop = True
	if crop:
		cropcmd = '-crop 256x256'
	else:
		cropcmd = ''
	blank = magick.blank( gridsize )
	base = '%s/tile-%d' %( path, zoom )
	command = ( '%s -draw "@draw.cmd" %s ' + base + '.png' )%( blank, cropcmd )
	#command = ( '%s -draw "@draw.cmd" %s -depth 8 -type Palette -floodfill 0x0 white -background white -transparent-color white ' + base + '.png' )%( blank, cropcmd )
	#command = ( 'null: -resize %dx%d! -floodfill 0x0 white -draw "@draw.cmd" %s -depth 8 -type Palette -background white -transparent white -transparent-color white ' + base + '.png' )%( gridsize[0], gridsize[1], cropcmd )
	#command = 'null: -resize %(cx)dx%(cy)d! -draw "@draw.cmd" %(crop)s tile%(zoom)d.png' %({
	#	'cx': gridsize[0],
	#	'cy': gridsize[1],
	#	'crop': crop,
	#	'zoom': zoom
	#})
	magick.convert( command )
	if crop:
		xyCount = 2 << zoom
		n = 0
		# TODO: refactor
		xMin = gridoffset[0] / 256
		xMinEdge = max( xMin - 2, 0 )
		yMin = gridoffset[1] / 256
		yMinEdge = max( yMin - 2, 0 )
		xN = gridsize[0] / 256
		yN = gridsize[1] /256
		xLim = xMin + xN
		xLimEdge = min( xLim + 2, xyCount )
		yLim = yMin + yN
		yLimEdge = min( yLim + 2, xyCount )
		nMoving = xN * yN
		nCopying = ( xLimEdge - xMinEdge ) * ( yLimEdge - yMinEdge ) - nMoving
		print 'Moving %d tiles, copying %d blank tiles...' %( nMoving, nCopying )
		t1 = time.time()
		for y in xrange( yMinEdge, yLimEdge ):
			for x in xrange( xMinEdge, xLimEdge ):
				target = '%s-%d-%d.png' %( base, y, x )
				if xMin <= x < xLim and yMin <= y < yLim:
					if xN == 1 and yN == 1:
						source = '%s.png' %( base )
					else:
						source = '%s-%d.png' %( base, n )
					if os.path.exists( target ): os.remove( target )
					if os.stat(source)[stat.ST_SIZE] > 415:
						os.rename( source, target )
					else:
						os.remove( source )
						shutil.copy( 'blanktile.png', target )
					n += 1
				else:
					shutil.copy( 'blanktile.png', target )
		t2 = time.time()
		print '%0.3f seconds to move files' %( t2 - t1 )

def drawFeatures( draw, features, getColor ):
	global geo, scaleoffset
	nPolys = nPoints = 0
	#for feature in features:
	for i in xrange(len(features)):
		feature = features[i]
		color = featureByName( feature )['color']
		#print 'Feature %d: %s' %( i, name )
		shape = feature['shape']
		if shape['type'] == 5:
			for part in shape['parts']:
				nPolys += 1
				if getColor:
					draw += '''
fill  #%s80
stroke #00000040
polygon''' % getColor(feature)
				else:
					draw += '''
fill  #00000000
stroke #00000060
polygon'''
				points = part['points']
				n = len(points) - 1
				nPoints += n
				for j in xrange(n):
					point = geo.pixFromGeoPoint( points[j] )
					draw += ' %d,%d' %( point[0] - scaleoffset[0], point[1] - scaleoffset[1] )
	print '%d points in %d polygons' %( nPoints, nPolys )

def getRandomColor( feature ):
	return randomColor()

for z in xrange(0,5):
	generate( None, 'states/st99_d00_shp-75/st99_d00.shp', None, 'tiles', z )
	
for z in xrange(5,9):
	generate( 'x', 'states/st99_d00_shp-75/st99_d00.shp', 'counties/co99_d00_shp-80/co99_d00.shp', 'tiles', z )

print 'Done!'
