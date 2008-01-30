#!/usr/bin/env python

import math

def geoToPixel( point, zoom, tilesize=256 ):
	lng = point[0]
	if lng > 180.0: lng -= 360.0
	lng = lng / 360.0 + 0.5

	lat = point[1]
	lat = 0.5 - ( math.log( math.tan( ( math.pi / 4.0 ) + ( lat * math.pi / 360.0 ) ) ) / math.pi / 2.0 );
	
	scale = ( 1 << zoom ) * tilesize
	return [ int( lng * scale ), int( lat * scale ) ]

print geoToPixel( [ 0.0, 0.0 ], 0 ) == [ 128, 128 ]
print geoToPixel( [ 0.0, 0.0 ], 1 ) == [ 256, 256 ]

print geoToPixel( [ -60.0, 45.0 ], 0 ) == [ 85, 92 ]
print geoToPixel( [ -60.0, 45.0 ], 1 ) == [ 170, 184 ]
