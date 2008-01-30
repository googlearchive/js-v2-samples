import math
from struct import unpack
import dbfUtils
XY_POINT_RECORD_LENGTH = 16
db = []

def loadShapefile(file_name):
	global db
	shp_type = 0
	file_name = file_name
	records = []
	# open dbf file and get records as a list
	dbfile = open( file_name[0:-4] + '.dbf', 'rb' )
	db = list(dbfUtils.dbfreader(dbfile))
	dbfile.close()
	fp = open(file_name, 'rb')
	
	# get basic shapefile configuration
	fp.seek(32)
	shp_type = readAndUnpack('i', fp.read(4))
	#shp_bounds = readBounds(fp)
	
	# fetch Records
	fp.seek(100)
	while True:
		shp_record = createRecord(fp)
		if shp_record == False: break
		records.append(shp_record)
	return records    

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
	
	return {'shape':shape, 'info':info}       
	
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
	data = {}
	return data

point_count = 0
def readRecordPoint(fp):
	global point_count
	data = {
		'x': readAndUnpack('d', fp.read(8)),
		'y': readAndUnpack('d', fp.read(8))
	}
	point_count += 1
	return data

    
def readRecordMultiPoint(fp):
	data = { 'bounds': readBounds(fp) }
	points = data['points'] = []
	npoints = readAndUnpack('i', fp.read(4))        
	for i in xrange(npoints):
		points.append(readRecordPoint(fp))
	return data

def readRecordPolyLine(fp):
	data = { 'bounds': readBounds(fp) }
	nparts = readAndUnpack('i', fp.read(4))
	npoints = readAndUnpack('i', fp.read(4))
	parts = data['parts'] = []
	for i in xrange(nparts):
		parts.append(readAndUnpack('i', fp.read(4)))
	points_initial_index = fp.tell()
	points_read = 0
	for part_index in xrange(nparts):
		point_index = parts[part_index] = {}
		
		# if(!isset(data['parts'][part_index]['points']) or !is_array(data['parts'][part_index]['points'])):
		points = point_index['points'] = []
		
		# while( ! in_array( points_read, data['parts']) and points_read < data['npoints'] and !feof(fp)):
		while (points_read < npoints):
			points.append(readRecordPoint(fp))
			points_read += 1
	fp.seek(points_initial_index + (points_read * XY_POINT_RECORD_LENGTH))
	return data

# General defs
    
def readBounds(fp):
	return {
		'min': {
			'x': readAndUnpack('d',fp.read(8)),
			'y': readAndUnpack('d',fp.read(8))
		},
		'max': {
			'x': readAndUnpack('d',fp.read(8)),
			'y': readAndUnpack('d',fp.read(8))
		}
	}

def readAndUnpack(type, data):
	if data=='': return data
	return unpack(type, data)[0]

def getPolyInfo(records):
	for feature in records:
		npoints = cx = cy = 0
		shape = feature['shape']
		if shape['type'] == 3  or shape['type'] ==5:
			for part in shape['parts']:
				getPartInfo( part )

def getPartInfo( part ):
	points = part['points']
	n = len(points)
	area = cx = cy = 0
	xmin = ymin = 360
	xmax = ymax = -360
	pt = points[n-1];  xx = pt['x'];  yy = pt['y']
	for pt in points:
		x = pt['x'];  y = pt['y']
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
		'area': math.fabs(area),
		'bounds': { 'min': { 'x': xmin, 'y': ymin }, 'max': { 'x': xmax, 'y': ymax } },
		'center': { 'x': ( xmin + xmax ) / 2, 'y': ( ymin + ymax ) / 2 },
		'centroid': { 'x': cx / area / 6, 'y': cy / area / 6 },
		'extent': { 'x': math.fabs( xmax - xmin ), 'y': math.fabs( ymax - ymin ) }
	})

def getBoundCenters(records):
	for feature in records:
		bounds = feature['shape']['bounds']
		min = bounds['min'];  max = bounds['max']
		bounds['center'] = {
			'x': ( min['x'] + max['x'] ) / 2,
			'y': ( min['y'] + max['y'] ) / 2
		}
	
def getMAT(records):
	print 'feature not yet available'
