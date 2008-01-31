#!/usr/bin/env python

# shpUtils.py
# Original version by Zachary Forest Johnson
# http://indiemaps.com/blog/index.php/code/pyShapefile.txt
# This version modified by Michael Geary

from struct import unpack
import dbfUtils
XY_POINT_RECORD_LENGTH = 16
db = []

def loadShapefile( filename ):
	# open dbf file and get features as a list
	global db
	dbfile = open( filename[0:-4] + '.dbf', 'rb' )
	db = list( dbfUtils.dbfreader(dbfile) )
	dbfile.close()
	
	fp = open( filename, 'rb' )
	
	# get basic shapefile configuration
	fp.seek(32)
	type = readAndUnpack('i', fp.read(4))
	bounds = readBounds( fp )
	
	# fetch Records
	fp.seek(100)
	features = []
	while True:
		feature = createRecord(fp)
		if feature == False: break
		getPolyInfo( feature )
		features.append( feature )
	return { 'type': type, 'bounds': bounds, 'features': features }

record_class = { 0:'RecordNull', 1:'RecordPoint', 8:'RecordMultiPoint', 3:'RecordPolyLine', 5:'RecordPolygon' }

def createRecord(fp):
	# read header
	record_number = readAndUnpack('>L', fp.read(4))
	if record_number == '': return False
	content_length = readAndUnpack('>L', fp.read(4))
	type = readAndUnpack('<L', fp.read(4))

	shape = readRecordAny(fp,type)
	shape['type'] = type
	info = {}
	names = db[0]
	values = db[record_number+1]
	for i in xrange(len(names)):
		info[ names[i] ] = values[i]
	
	return { 'shape':shape, 'info':info }
	
# Reading defs

def readRecordAny(fp, type):
	if type==0:
		return readRecordNull(fp)
	elif type==1:
		return readRecordPoint(fp)
	elif type==8:
		return readRecordMultiPoint(fp)
	elif type==3 or type==5:
		return readRecordPolyLine(fp)
	else:
		return False

def readRecordNull(fp):
	return {}

point_count = 0
def readRecordPoint(fp):
	global point_count
	point = [ readAndUnpack('d', fp.read(8)), readAndUnpack('d', fp.read(8)) ]
	point_count += 1
	return point


def readRecordMultiPoint(fp):
	shape = { 'bounds': readBounds(fp) }
	points = shape['points'] = []
	nPoints = readAndUnpack('i', fp.read(4))
	for i in xrange(nPoints):
		points.append(readRecordPoint(fp))
	return shape

def readRecordPolyLine(fp):
	shape = { 'bounds': readBounds(fp) }
	nParts = readAndUnpack('i', fp.read(4))
	nPoints = readAndUnpack('i', fp.read(4))
	if readAndUnpack('i', fp.read(4)):
		print 'ERROR: First part offset must be 0'
	counts = []; prev = 0
	for i in xrange(nParts-1):
		next = readAndUnpack('i', fp.read(4))
		counts.append( next - prev )
		prev = next
	counts.append( nPoints - prev )
	parts = shape['parts'] = []
	for i in xrange(nParts):
		part = {}
		parts.append( part )
		points = part['points'] = []
		for j in xrange(counts[i]):
			points.append(readRecordPoint(fp))
	return shape

# General defs

def readBounds(fp):
	return [
		[ readAndUnpack('d',fp.read(8)), readAndUnpack('d',fp.read(8)) ],
		[ readAndUnpack('d',fp.read(8)), readAndUnpack('d',fp.read(8)) ]
	]

def readAndUnpack(type, data):
	if data=='': return data
	return unpack(type, data)[0]

def getPolyInfo( feature ):
	nPoints = cx = cy = 0
	shape = feature['shape']
	type = shape['type']
	if type == 3  or type ==5:
		for part in shape['parts']:
			getPartInfo( part )

def getPartInfo( part ):
	points = part['points']
	n = len(points)
	area = cx = cy = 0
	xmin = ymin = 360
	xmax = ymax = -360
	pt = points[n-1];  xx = pt[0];  yy = pt[1]
	for pt in points:
		x = pt[0];  y = pt[1]
		# bounds
		xmin = min( x, xmin );  ymin = min( y, ymin )
		xmax = max( x, xmax );  ymax = max( y, ymax )
		# area and centroid
		a = xx * y - x * yy
		area += a
		cx += ( x + xx ) * a
		cy += ( y + yy ) * a
		# next
		xx = x;  yy = y
	area /= 2
	if area == 0: return None
	part.update({
		'area': abs(area),
		'bounds': [ [ xmin, ymin ], [ xmax, ymax ] ],
		'center': [ ( xmin + xmax ) / 2, ( ymin + ymax ) / 2 ],
		'centroid': [ cx / area / 6, cy / area / 6 ],
		'extent': [ abs( xmax - xmin ), abs( ymax - ymin ) ]
	})

def getBoundCenters(features):
	for feature in features:
		bounds = feature['shape']['bounds']
		min = bounds[0];  max = bounds[1]
		bounds['center'] = [
			( min[0] + max[0] ) / 2,
			( min[1] + max[1] ) / 2
		]
	
def getMAT(features):
	print 'feature not yet available'
