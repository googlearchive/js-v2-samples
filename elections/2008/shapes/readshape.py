#!/usr/bin/env python

# readshape.py - test
import sys
import time
import shpUtils

t1 = time.time()

# load the shapefile, populating a list of dictionaries
#features = shpUtils.loadShapefile( 'states/st99_d00_shp/st99_d00.shp')
shapefile = shpUtils.loadShapefile( 'states/st99_d00_shp-90/st99_d00.shp')
features = shapefile['features']

t2 = time.time()

print '%0.3f seconds load time' %( t2 - t1 )

print '%d features' % len(features)

#for feature in features:
for i in xrange(len(features)):
	feature = features[i]
	info = feature['info']
	shape = feature['shape']
	type = shape['type']
	if type == 0:
		pass
	elif type == 5:
		parts = shape['parts']
		if len(parts) > 1:
			print i, len(parts)
	else:
		print 'bad type = %d' % type

#print features[0]['info']
#for part in features[0]['shape']:
#	print part, features[0]['shape'][part]

