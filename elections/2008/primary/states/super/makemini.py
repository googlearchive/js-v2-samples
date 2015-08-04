#!/usr/bin/env python

# reader.py - vote reader for Super Tuesday

import csv
import os
import re
import time
import urllib
import states
from template import *

import private
from candidates import candidates

parties = {
	'dem': { 'name':'Democrats' },
	'gop': { 'name':'Republicans' }
}

def fetchData():
	urllib.urlretrieve( private.csvFeedUrl, 'miniresults/text_output_for_mapping.csv' )
	pass

def readVotes():
	print 'Processing vote data'
	#reader = csv.reader( open( 'test.csv', 'rb' ) )
	reader = csv.reader( open( 'miniresults/text_output_for_mapping.csv', 'rb' ) )
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
			<span style="font-weight:bold;">
				%(name)s
			</span>
		''', { 'name': name } )
	else:
		return T('''
			<a href="#" onclick="refresh('%(party)s'); return false;">
				%(name)s
			</a>
		''', { 'name': name, 'party': party } )

def makeMini():
	short = makeMiniVersion( 'short', 'Election&nbsp;Coverage', 'CA NY IL MA' )
	long = makeMiniVersion( 'long', 'Results', 'AL AK AZ AR CA CO CT DE GA ID IL KS MA MN MO MT NJ NM NY ND OK TN UT WV' )
	map = makeMiniVersion( 'map', 'Results', 'AL AK AZ AR CA CO CT DE GA ID IL KS MA MN MO MT NJ NM NY ND OK TN UT WV' )
	
def makeMiniVersion( kind, title, statenames ):
	writeMiniParty( kind, title, statenames, 'dem', 'clinton obama' )
	writeMiniParty( kind, title, statenames,'gop' , 'huckabee mccain paul romney' )

def writeMiniParty( kind, title, statenames, partyname, names ):
	text = makeMiniParty( kind, title, statenames, partyname, names )
	write( 'miniresults/miniresults-%s-%s.html' %( kind, partyname ), text )

def makeMiniParty( kind, title, statenames, partyname, names ):
	statelist = statenames.split()
	names = names.split()
	style = 'font-weight:normal; background-color:#E0E0E0;'
	head = [ '<th style="text-align:left; %s">State</th>' % style ]
	for name in names:
		head.append( T('''
			<th style="%(style)s">
				%(name)s
			</th>
		''', {
			'name': candidates['byname'][name]['lastName'],
			'style': style
		} ) )
	rows = []
	for stateabbr in statelist:
		if stateabbr == 'WV' and partyname == 'dem': continue
		state = states.byAbbr[stateabbr]
		cols = []
		winner = { 'name': None, 'votes': 0 }
		party = state['parties'][partyname]
		if 'votes' not in party: continue
		votes = party['votes']
		for name in votes:
			if name == 'total-d' or name == 'total-r':
				total = party['total'] = votes[name]
			else:
				vote = votes[name]
				if vote > winner['votes']:
					winner = { 'name': name, 'votes': vote }
		precincts = party['precincts']
		for name in names:
			win = check = ''
			if name == winner['name']:
				if partyname == 'dem':
					win = 'color:white; background-color:#3366CC;'
				else:
					win = 'color:white; background-color:#AA0031;'
				if precincts['reporting'] == precincts['total']:
					check = '<img src="http://googlemaps.github.io/js-v2-samples/elections/2008/images/checkmark.gif" style="width:7px; height:6px; margin:0 3px 2px 0" />'
			if name in votes and total > 0:
				percent = '%d%%' % percentage( float(votes[name]) / float(total) )
			else:
				percent = '--'
			cols.append( T('''
				<td style="width:%(width)s%%; text-align:center; %(win)s">
					<div>
						%(check)s
						%(percent)s
					</div>
				</td>
			''', {
				'width': 80 / len(names),
				'win': win,
				'check': check,
				'percent': percent
			}) )
		reporting = percentage( float(precincts['reporting']) / float(precincts['total']) )
		rows.append( T('''
			<tr style="background-color:#F1EFEF;">
				<td style="width:20%%;">
					<div>
						<span>
							%(state)s&nbsp;
						</span>
						<span style="font-size:11px; color:#666666;">
							%(reporting)s%%
						</span>
					</div>
				</td>
				%(cols)s
			</tr>
		''', {
			'state': stateabbr,
			'reporting': reporting,
			'cols': ''.join(cols)
		}) )
	if kind == 'short':
		details = S('''
			<a href="http://news.google.com/?ned=us&topic=el" target="_top" style="color:green;">
				Full election coverage and results &raquo;
			</a>
			&nbsp;&nbsp;&nbsp;&nbsp;
		''')
	else:
		details = ''
	if kind == 'map':
		follow = '<span id="spanFollow" style="display:none;"><input type="checkbox" checked="checked" id="chkFollow" /><label for="chkFollow">Follow</label></span>'
		viewmap = ''
	else:
		follow = ''
		viewmap = S('''
			<a href="http://maps.google.com/decision2008" target="_blank" style="color:green;">
				View on a map &raquo;
			</a>
		''')
	return T('''
		<div style="font-family:arial,sans-serif; font-size:13px;">
			<div style="margin-bottom:4px;">
				<table style="width:100%%;">
					<tbody>
						<tr style="vertical-align: baseline;">
							<td>
								<div style="font-size:16px; font-weight:bold;">
									%(title)s
								</div>
							</td>
							<td style="text-align:center;">
								<div style="font-size:13px;">
									%(follow)s
								</div>
							</td>
							</td>
							<td style="text-align:right;">
								<div style="font-size:13px;">
									%(dem)s&nbsp;|&nbsp;%(gop)s
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<table style="width:100%%; font-size:13px;">
				<thead>
					%(head)s
				</thead>
				<tbody>
					%(rows)s
				</tbody>
			</table>
			<div>
				%(details)s
				%(viewmap)s
			</div>
		</div>
		''', {
			'title': title + ': ',
			'follow': follow,
			'dem': linkParty( 'dem', partyname ),
			'gop': linkParty( 'gop', partyname ),
			'head': ''.join(head),
			'rows': ''.join(rows),
			'details': details,
			'viewmap': viewmap
		})

def percentage( n ):
	pct = int( round( 100.0 * float(n) ) )
	if pct == 100 and n < 1: pct = 99
	return pct


def write( name, text ):
	#print 'Writing ' + name
	f = open( name, 'w' )
	f.write( text )
	f.close()
	
def update():
	print 'Retrieving data...'
	fetchData()
	print 'Parsing data...'
	readVotes()
	print 'Creating Miniresults HTML...'
	makeMini()
	print 'Checking in Miniresults HTML...'
	os.system( 'svn ci -m "Miniresults update" miniresults/*' )
	print 'Done!'

def main():
	while 1:
		update()
		print 'Waiting 10 minute...'
		time.sleep( 600 )

if __name__ == "__main__":
    main()
