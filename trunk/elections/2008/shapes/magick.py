#!/usr/bin/env python

# magick.py

import magickp
import os
import os.path
import subprocess
import time

def convert( command, timer=True ):
	print 'convert' + ' ' + command
	t1 = time.time()
	os.system( 'convert' + ' ' + command )
	#subprocess.call( [ ( magickp.convert or 'convert' ), command ] )
	t2 = time.time()
	if timer: print 'convert took %0.3f seconds' %( t2 - t1 )

def blank( size ):
	cx = size[0]; cy = size[1]
	filename = 'blanks/blank-%d-%d.png' %( size[0], size[1] )
	if not os.path.exists( filename ):
		convert( 'null: -resize %dx%d! %s' %( size[0], size[1], filename ) )
		#convert( 'null: -resize %dx%d! -depth 8 -type Palette -floodfill 0x0 white -background white -transparent white -transparent-color white %s' %( size[0], size[1], filename ) )
	return filename

#convert( '-version', False )
#blank( [ 256, 256 ] )

#blank( [ 5632, 3328 ] )
