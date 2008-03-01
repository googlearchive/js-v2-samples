#!/usr/bin/env python

candidates = {
	'all': [],
	'byname': {},
	'dem': [
		{ 'name': 'biden', 'lastName': 'Biden', 'fullName': 'Joe Biden', 'color': '#20FF1F', 'feed': '' },
		{ 'name': 'clinton', 'lastName': 'Clinton', 'fullName': 'Hillary Clinton', 'color': '#FFFA00', 'feed': '2jmb4ula0um5138qnfk621nagg' },
		{ 'name': 'dodd', 'lastName': 'Dodd', 'fullName': 'Chris Dodd', 'color': '#E4Af95', 'feed': 'l06f7eei6qfjns5a4pd5nv6erg' },
		{ 'name': 'edwards', 'lastName': 'Edwards', 'fullName': 'John Edwards', 'color': '#FF1300', 'feed': '46uusesnavfh045mmfjje0fflo' },
		{ 'name': 'gravel', 'lastName': 'Gravel', 'fullName': 'Mike Gravel', 'color': '#8A5C2E', 'feed': '47r7phlvf8e07lga3poj0ntv8g' },
		{ 'name': 'kucinich', 'lastName': 'Kucinich', 'fullName': 'Dennis Kucinich', 'color': '#EE00B5', 'feed': '7c9gellom85djmbl6664s9cclc' },
		{ 'name': 'obama', 'lastName': 'Obama', 'fullName': 'Barack Obama', 'color': '#1700E8', 'feed': 'nkt5atdq7cdbes3ehdfpendpnc' },
		{ 'name': 'richardson', 'lastName': 'Richardson', 'fullName': 'Bill Richardson', 'color': '#336633', 'feed': 'mdgiev7eul12rt1lo6eohg55q0' },
		{ 'name': 'uncommitted-d', 'lastName': 'Uncommitted', 'fullName': 'Uncommitted', 'color': '#DDDDDD', 'feed': '' },
		{ 'name': 'total-d', 'lastName': 'Total Democratic', 'fullName': 'Total Democratic', 'color': '#000000', 'feed': '' }
	],
	'gop': [
		{ 'name': 'brownback', 'lastName': 'Brownback', 'fullName': 'Sam Brownback', 'color': '#8080FF', 'feed': 'lm63qmbqunob5gbvratl1bo974' },
		{ 'name': 'cort', 'lastName': 'Cort', 'fullName': 'Hugh Cort', 'color': '#8080FF' },
		{ 'name': 'cox', 'lastName': 'Cox', 'fullName': 'John Cox', 'color': '#808040' },
		{ 'name': 'fendig', 'lastName': 'Fendig', 'fullName': 'Cap Fendig', 'color': '#408080' },
		{ 'name': 'giuliani', 'lastName': 'Giuliani', 'fullName': 'Rudy Giuliani', 'color': '#336633', 'feed': 'g0tkl52ft6nhrlm2e6v6his400' },
		{ 'name': 'huckabee', 'lastName': 'Huckabee', 'fullName': 'Mike Huckabee', 'color': '#1700E8', 'feed': 'h32i31ojgo9vvb3vnggmq1qrh8' },
		{ 'name': 'hunter', 'lastName': 'Hunter', 'fullName': 'Duncan Hunter', 'color': '#8A5C2E', 'feed': '' },
		{ 'name': 'keyes', 'lastName': 'Keyes', 'fullName': 'Alan Keyes', 'color': '#8080FF', 'feed': '' },
		{ 'name': 'mccain', 'lastName': 'McCain', 'fullName': 'John McCain', 'color': '#FFFA00', 'feed': 'q1du1ju69m8jecsjkhjr538kbs' },
		{ 'name': 'paul', 'lastName': 'Paul', 'fullName': 'Ron Paul', 'color': '#E4Af95', 'feed': '7p20d17uil4ft2qhvattqrjdgg' },
		{ 'name': 'romney', 'lastName': 'Romney', 'fullName': 'Mitt Romney', 'color': '#FF1300', 'feed': '3mv48r8us0rou62c356om8groc' },
		{ 'name': 'tancredo', 'lastName': 'Tancredo', 'fullName': 'Tom Tancredo', 'color': '#EE00B5', 'feed': '' },
		{ 'name': 'thompson', 'lastName': 'Thompson', 'fullName': 'Fred Thompson', 'color': '#20FF1F', 'feed': 'fhg9gjvi7459qaf0ki43ij1g78' },
		{ 'name': 'tran', 'lastName': 'Tran', 'fullName': 'Hoa Tran', 'color': '#F0201F' },
		{ 'name': 'uncommitted-r', 'lastName': 'Uncommitted', 'fullName': 'Uncommitted', 'color': '#DDDDDD', 'feed': '' },
		{ 'name': 'total-r', 'lastName': 'Total Republican', 'fullName': 'Total Republican', 'color': '#000000', 'feed': '' }
	]
}

def indexCandidates( party ):
	for candidate in  candidates[party]:
		candidate['party'] = party
		candidates['byname'][ candidate['name'] ] = candidate
		candidates['all'].append( candidate )

candidates['byname'] = {}
indexCandidates( 'dem' )
indexCandidates( 'gop' )
