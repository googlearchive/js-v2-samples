#!/usr/bin/env python

# reader.py - vote reader for Super Tuesday

import private
import re
import urllib
import csv
import states
from template import T

from candidates import candidates

parties = {
	'dem': { 'name':'Democratic' },
	'gop': { 'name':'Republican' }
}

def fetchData():
	urllib.urlretrieve( private.csvFeedUrl, 'text_output_for_mapping.csv' )
	pass

def readVotes():
	print 'Processing vote data'
	#reader = csv.reader( open( 'test.csv', 'rb' ) )
	reader = csv.reader( open( 'text_output_for_mapping.csv', 'rb' ) )
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
		'reporting': int(row[3]),
		'total': int(row[2])
	}

def setVotes( entity, header, row ):
	for col in xrange( 4, len(header) ):
		if col >= len(row) or row[col] == '': continue
		name = header[col]
		if name == 'guiliani': name = 'giuliani'
		candidate = candidates['byname'][name]
		party = candidate['party']
		p = entity['parties'][party]
		if 'precincts' not in p: p['precincts'] = getPrecincts( row )
		if 'votes' not in p: p['votes'] = {}
		p['votes'][name] = int(row[col])

def linkParty( party, match ):
	name = parties[party]['name']
	if party == match:
		return T('''
			<span class="thatparty">
				%(name)s
			</span>
		''', { 'name': name } )
	else:
		return T('''
			<a class="thisparty" href="#" onclick="switchParty('%(party)s')">
				%(name)s
			</span>
		''', { 'name': name, 'party': party } )

def makeMini():
	short = makeMiniVersion( 'short', 'CA NY IL MA' )
	long = makeMiniVersion( 'long', 'AL AK AZ AR CA CO CT DE GA ID IL KS MA MN MO MT NJ NM NY ND OK TN UT' )
	
def makeMiniVersion( kind, statenames ):
	writeMiniParty( kind, statenames, 'dem', 'clinton obama' )
	writeMiniParty( kind, statenames,'gop' , 'huckabee mccain paul romney' )

def writeMiniParty( kind, statenames, partyname, names ):
	text = makeMiniParty( statenames, partyname, names )
	write( 'miniresults-%s-%s.html' %( kind, partyname ), text )

def makeMiniParty( statenames, partyname, names ):
	statelist = statenames.split()
	names = names.split()
	head = [ '<th class="state">State</th>' ]
	for name in names:
		head.append( T('''
			<th class="name">
				%(name)s
			</th>
		''', { 'name':name } ) )
	rows = []
	for stateabbr in statelist:
		state = states.byAbbr[stateabbr]
		cols = []
		winner = { 'name': None, 'votes': 0 }
		total = 0
		party = state['parties'][partyname]
		if 'votes' not in party: continue
		votes = party['votes']
		for name in votes:
			total += votes[name]
			if votes[name] > winner['votes']:
				winner = { 'name': name, 'votes': winner['votes'] }
		precincts = party['precincts']
		for name in names:
			win = check = ''
			if name == winner['name']:
				win = 'win'
				if precincts['reporting'] == precincts['total']:
					check = 'check'
			if name in votes:
				percent = int( 100 * votes[name] / total )
			else:
				percent = 0
			cols.append( T('''
				<td class="votes %(win)s %(check)s">
					%(percent)s
				</td>
			''', {
				'win':win,
				'check':check,
				'percent':percent
			}) )
		percent = int( 100 * precincts['reporting'] / precincts['total'] )
		rows.append( T('''
			<tr class="state">
				<td class="state">
					<span class="state">
						%(state)s
					</span>
					<span class="percent">
						%(percent)s%%
					</span>
				</td>
				%(cols)s
			</tr>
		''', {
			'state': stateabbr,
			'percent': percent,
			'cols': ''.join(cols)
		}) )
	return T('''
		<div class="top">
			<span class="resultstitle">
				Results:
			</span>
			<span class="partylinks">
				%(dem)s | %(gop)s
			</span>
		</div>
		<table class="results">
			<thead>
				%(head)s
			</thead>
			<tbody>
				%(rows)s
			</tbody>
		</table>
		<div class="foot">
			<a href="http://maps.google.com/decision2008" target="_top">
				View on a map
			</a>
		</div>
		''', {
			'dem': linkParty( 'dem', partyname ),
			'gop': linkParty( 'gop', partyname ),
			'head': ''.join(head),
			'rows': ''.join(rows)
		})

def write( name, text ):
	print 'Writing ' + name
	f = open( name, 'w' )
	f.write( text )
	f.close()
	
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