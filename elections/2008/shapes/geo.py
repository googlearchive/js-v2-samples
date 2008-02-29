#!/usr/bin/env python

import math

class Geo:
	
	def __init__( self, zoom=0, tilesize=256 ):
		self.zoom = zoom
		self.tilesize = tilesize
	
	def extendBounds( self, a, b ):
		return [
			[ min( a[0][0] , b[0][0] ), min( a[0][1] , b[0][1] ) ],
			[ max( a[1][0] , b[1][0] ), max( a[1][1] , b[1][1] ) ]
		]
	
	def inflateBounds( self, a, n ):
		return [
			[ a[0][0] - n, a[0][1] - n ],
			[ a[1][0] + n, a[1][1] + n ]
		]
	
	def offsetBounds( self, a, pt ):
		return [
			[ a[0][0] + pt[0], a[0][1] + pt[1] ],
			[ a[1][0] + pt[0], a[1][1] + pt[1] ]
		]
	
	def offsetBoundsMinus( self, a, pt ):
		return [
			[ a[0][0] - pt[0], a[0][1] - pt[1] ],
			[ a[1][0] - pt[0], a[1][1] - pt[1] ]
		]
	
	def scalePoint( self, pt, scale ):
		return [ pt[0] * scale, pt[1] * scale ]
	
	def scaleBounds( self, a, scale ):
		return [ self.scalePoint( a[0], scale ), self.scalePoint( a[1], scale ) ]
	
	def tileBounds( self,  bounds ):
		def lo( n ): return int( n / self.tilesize ) * self.tilesize
		def hi( n ): return ( int( n / self.tilesize ) + 1 ) * self.tilesize
		min = bounds[0]; max = bounds[1]
		offset = [ lo(min[0]), lo(min[1]) ]
		size = [ hi(max[0]) - offset[0], hi(max[1]) - offset[1] ]
		return offset, size
	
	def pixFromGeoPoint( self, point ):
		lng = point[0]
		if lng > 180.0: lng -= 360.0
		lng = lng / 360.0 + 0.5
	
		lat = point[1]
		lat = 0.5 - ( math.log( math.tan( ( math.pi / 4.0 ) + ( lat * math.pi / 360.0 ) ) ) / math.pi / 2.0 );
		
		scale = ( 1 << self.zoom ) * self.tilesize
		return [ int( lng * scale ), int( lat * scale ) ]
	
	def pixFromGeoBounds( self, bounds ):
		a = self.pixFromGeoPoint(bounds[0])
		b = self.pixFromGeoPoint(bounds[1])
		return [
			[ a[0], b[1] ],
			[ b[0], a[1] ]
		]

#print geoToPixel( [ 0.0, 0.0 ], 0 ) == [ 128, 128 ]
#print geoToPixel( [ 0.0, 0.0 ], 1 ) == [ 256, 256 ]
#
#print geoToPixel( [ -60.0, 45.0 ], 0 ) == [ 85, 92 ]
#print geoToPixel( [ -60.0, 45.0 ], 1 ) == [ 170, 184 ]
#
#print geoToPixel( [ 0.0, 0.0 ], 13 )
