#!/usr/bin/env python

# reader.py - vote reader for SC primary

import private
import re
import urllib
import csv

candidates = {
	'all': [],
	'democrat': [
		#{ 'name': 'biden', 'lastName': 'Biden', 'fullName': 'Joe Biden', 'color': '#20FF1F' },
		{ 'name': 'clinton', 'lastName': 'Clinton', 'fullName': 'Hillary Clinton', 'color': '#FFFA00' },
		{ 'name': 'dodd', 'lastName': 'Dodd', 'fullName': 'Chris Dodd', 'color': '#E4Af95' },
		#{ 'name': 'edwards', 'lastName': 'Edwards', 'fullName': 'John Edwards', 'color': '#FF1300' },
		{ 'name': 'gravel', 'lastName': 'Gravel', 'fullName': 'Mike Gravel', 'color': '#8A5C2E' },
		{ 'name': 'kucinich', 'lastName': 'Kucinich', 'fullName': 'Dennis Kucinich', 'color': '#EE00B5' },
		#{ 'name': 'obama', 'lastName': 'Obama', 'fullName': 'Barack Obama', 'color': '#1700E8' },
		#{ 'name': 'richardson', 'lastName': 'Richardson', 'fullName': 'Bill Richardson', 'color': '#336633' },
		{ 'name': 'uncommitted-d', 'lastName': 'Uncommitted', 'fullName': 'Uncommitted', 'color': '#336633' },
	],
	'republican': [
		{ 'name': 'cort', 'lastName': 'Cort', 'fullName': 'Hugh Cort', 'color': '#8080FF' },
		{ 'name': 'cox', 'lastName': 'Cox', 'fullName': 'John Cox', 'color': '#808040' },
		{ 'name': 'fendig', 'lastName': 'Fendig', 'fullName': 'Cap Fendig', 'color': '#408080' },
		#{ 'name': 'brownback', 'lastName': 'Brownback', 'fullName': 'Sam Brownback', 'color': '#8080FF' },
		{ 'name': 'giuliani', 'lastName': 'Giuliani', 'fullName': 'Rudy Giuliani', 'color': '#336633' },
		{ 'name': 'huckabee', 'lastName': 'Huckabee', 'fullName': 'Mike Huckabee', 'color': '#1700E8' },
		{ 'name': 'hunter', 'lastName': 'Hunter', 'fullName': 'Duncan Hunter', 'color': '#8A5C2E' },
		#{ 'name': 'keyes', 'lastName': 'Keyes', 'fullName': 'Alan Keyes', 'color': '#8080FF' },
		{ 'name': 'mccain', 'lastName': 'McCain', 'fullName': 'John McCain', 'color': '#FFFA00' },
		{ 'name': 'paul', 'lastName': 'Paul', 'fullName': 'Ron Paul', 'color': '#E4Af95' },
		{ 'name': 'romney', 'lastName': 'Romney', 'fullName': 'Mitt Romney', 'color': '#FF1300' },
		{ 'name': 'tancredo', 'lastName': 'Tancredo', 'fullName': 'Tom Tancredo', 'color': '#EE00B5' },
		{ 'name': 'thompson', 'lastName': 'Thompson', 'fullName': 'Fred Thompson', 'color': '#20FF1F' },
		#{ 'name': 'uncommitted-r', 'lastName': 'Uncommitted', 'fullName': 'Uncommitted', 'color': '#8080FF' },
	]
}

def indexCandidates( party ):
	dict = candidates['byname'][party] = {}
	for candidate in  candidates[party]:
		dict[candidate['name']] = candidate

candidates['byname'] = {}
indexCandidates( 'democrat' )
indexCandidates( 'republican' )

def fetchData():
	urllib.urlretrieve( private.csvFeedUrl, 'sc_text_output_for_mapping.csv' )
	
def readVotes( data, party ):
	print 'Processing vote data'
	reader = csv.reader( open( 'sc_text_output_for_mapping.csv', 'rb' ) )
	header = []
	while header == []:
		header = reader.next()
	#print header
	for row in reader:
		if len(row) == 0: continue
		countyName = fixCountyName( row[0] )
		if countyName == '*':
			if( ( party == 'democrat' and row[99] ) or ( party == 'republican' and row[3] ) ):
				setData( header, data['state'], row, party )
		else:
			setData( header, data['counties'][countyName], row, party )

def setData( header, county, row, party ):
	setPrecincts( county, row )
	if party != 'democrat':
		setVotes( header, county, row, 3, 'republican' )
	if party != 'republican':
		setVotes( header, county, row, 99, 'democrat' )

def setPrecincts( county, row ):
	county['precincts'] = {
		'reporting': row[2],
		'total': row[1]
	}

def setVotes( header, county, row, col, party ):
	if row[col] == '': return
	tally = []
	total = 0
	for candidate in candidates[party]:
		if header[col] == 'trancredo': header[col] = 'tancredo'
		if candidate['name'] != header[col]:
			print 'ERROR!'
		votes = int(row[col] or 0)
		if votes:
			total += votes
			tally.append({ 'name':candidate['name'], 'votes':votes })
		col += 1
	county['total'] = total
	tally.sort( lambda a, b: b['votes'] - a['votes'] )
	county[party] = tally

def fixCountyName( name ):
	fixNames = {
		#"Harts Location": "Hart's Location",
		#"Waterville": "Waterville Valley"
	}
	if( name in fixNames ):
		name = fixNames[name]
	#print 'County: %s' % name
	return name

#def getCounties( candidateNames ):
#	counties = {}
#	for countyName in countyNames:
#		counties[countyName] = getCounty( countyName, candidateNames )
#	return counties
#
#def getCounty( countyName, candidateNames ):
#	candidates = {}
#	for who in candidateNames.split():
#		candidates[who] = {
#			'votes': 0
#		}
#	county = {
#		'county': countyName,
#		'candidates': candidates,
#		'total': 0,
#		'precincts': {
#			'reporting': 0,
#			'total': 0
#		}
#	}
#	return county
#
#def jsonDemocrat():
#	if True:
#		print 'Retrieving Democrat data'
#		urllib.urlretrieve( 'http://origin-www.desmoinesregister.com/assets/xml/dems_results_counties.xml', 'dems_results_counties.xml' )
#	print 'Processing Democrat results'
#	#counties = getCounties('biden clinton dodd edwards gravel kucinich obama richardson other uncommitted')
#	names = 'biden clinton dodd edwards gravel kucinich obama richardson'
#	state = getCounty( 'state', names )
#	counties = getCounties( names )
#	dems = et.parse( 'dems_results_counties.xml' )
#	for marker in dems.getiterator('marker'):
#		def intvalue( name ): return int( marker.attrib[name] )
#		countyName = fixCountyName( marker.attrib['countyname'] )
#		county = counties[countyName]
#		candidates = county['candidates']
#		can = []
#		total = 0
#		for name in candidates:
#			candidate = candidates[name]
#			candidate['name'] = name
#			votes = candidate['votes'] = intvalue('count_'+name)
#			state['candidates'][name]['votes'] += votes
#			total += votes
#			if votes:
#				can.append( candidate )
#		can.sort( lambda a, b: b['votes'] - a['votes'] )
#		county['candidates'] = can
#		county['total'] = total
#		state['total'] += total
#		precinctsReporting = intvalue('precinctsreporting')
#		precinctsTotal = intvalue('precinctstotal')
#		county['precincts'].update({
#			'reporting': precinctsReporting,
#			'total': precinctsTotal
#		})
#		state['precincts']['reporting'] += precinctsReporting
#		state['precincts']['total'] += precinctsTotal
#	can = []
#	for name in state['candidates']:
#		candidate = state['candidates'][name]
#		candidate['name'] = name
#		can.append( candidate )
#	can.sort( lambda a, b: b['votes'] - a['votes'] )
#	state['candidates'] = can
#	
#	result = {
#		'status': 'ok',
#		'state': state,
#		'counties': counties
#	}
#	
#	return 'Json.democratResults(%s)' % json( result )
#
#def jsonRepublican():
#	if False:
#		print 'Reading Republican directory'
#		ftp = ftplib.FTP( 'ursaminor.1888932-2946.ws', 'iowagop', 'iowa@#!$' )
#		file = open( 'iowa_results.csv', 'wb' )
#		lines = []
#		ftp.retrlines( 'LIST', lines.append )
#		files = []
#		for line in lines:
#			split = line.split()
#			hm = split[7].split(':')
#			time = split[6] + hm[0] + hm[1]
#			name = split[8]
#			if name.find('iowacodes_') == 0:
#				files.append([ time, name ])
#		files.sort( lambda a, b: int(b[0]) - int(a[0]) )
#		filename = files[0][1]
#		print 'Retrieving Republican data from ' + filename
#		ftp.retrbinary( 'RETR ' + filename, file.write )
#		file.close()
#		ftp.quit()
#	print 'Processing Republican results'
#	names = 'giuliani huckabee hunter mccain paul romney tancredo thompson'
#	state = getCounty( 'state', names )
#	counties = getCounties( names )
#	reader = csv.reader( open( 'iowa_results.csv', 'rb' ) )
#	header = reader.next()
#	for row in reader:
#		countyName = fixCountyName( row[13] )
#		county = counties[countyName]
#		candidates = county['candidates']
#		reported = False
#		for i in 2,3,4,5,6,7,8,9:
#			who = header[i]
#			candidate = candidates[who]
#			n = row[i].strip()
#			if( n != '' ):
#				candidate['votes'] += int(n)
#				reported = True
#		if reported:
#			county['precincts']['reporting'] += 1
#			state['precincts']['reporting'] += 1
#		county['precincts']['total'] += 1
#		state['precincts']['total'] += 1
#	for countyName in counties:
#		if countyName != '*':
#			county = counties[countyName]
#			candidates = county['candidates']
#			can = []
#			total = 0
#			for name in candidates:
#				candidate = candidates[name]
#				votes = candidate['votes']
#				state['candidates'][name]['votes'] += votes
#				total += votes
#				candidate['name'] = name
#				if votes:
#					can.append( candidate )
#			can.sort( lambda a, b: b['votes'] - a['votes'] )
#			county['candidates'] = can
#			county['total'] = total
#			state['total'] += total
#	can = []
#	for name in state['candidates']:
#		candidate = state['candidates'][name]
#		candidate['name'] = name
#		can.append( candidate )
#	can.sort( lambda a, b: b['votes'] - a['votes'] )
#	state['candidates'] = can
#
#	result = {
#		'status': 'ok',
#		'state': state,
#		'counties': counties
#	}
#
#	return 'Json.republicanResults(%s)' % json( result )
#
