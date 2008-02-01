#!/usr/bin/env python

# reader.py - vote reader for Super Tuesday

import private
import re
import urllib
import csv
import states

from candidates import candidates

def fetchData():
	#urllib.urlretrieve( private.csvFeedUrl, 'test.csv' )
	pass

def readVotes():
	print 'Processing vote data'
	reader = csv.reader( open( 'test.csv', 'rb' ) )
	header = []
	while header == []:
		header = reader.next()
	#print header
	for row in reader:
		if len(row) < 2: continue
		if row[1] != '*': continue
		setData( header, row )

def setData( header, row ):
	state = states.byAbbr[ row[0] ]
	setVotes( state, header, row )

def getPrecincts( row ):
	return {
		'reporting': row[3],
		'total': row[2]
	}

def setVotes( entity, header, row ):
	for col in xrange( 4, len(header) ):
		if col >= len(row) or row[col] == '': continue
		name = header[col]
		if name == 'uncommitted-': name = 'uncommitted-r' # TEMP HACK
		if name == 'guiliani': name = 'giuliani' # TEMP HACK
		candidate = candidates['byname'][name]
		party = candidate['party']
		p = entity['parties'][party]
		if 'precincts' not in p: p['precincts'] = getPrecincts( row )
		if 'votes' not in p: p['votes'] = {}
		p['votes'][name] = row[col]

def makeMini():
	pass
	
def main():
	print 'Retrieving data...'
	fetchData()
	print 'Parsing data...'
	readVotes()
	print 'Creating Mini Gadget HTML...'
	makeMini()
	#print 'Checking in Maps JSON...'
	#os.system( 'svn ci -m "Vote update" fl_text_output_for_mapping.csv data.js results_democrat.js results_republican.js' )
	print 'Done!'

if __name__ == "__main__":
    main()
