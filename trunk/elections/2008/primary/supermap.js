if( ! Array.prototype.forEach ) {
	Array.prototype.forEach = function( fun /*, thisp*/ ) {
		if( typeof fun != 'function' )
			throw new TypeError();
		
		var thisp = arguments[1];
		for( var i = 0, n = this.length;  i < n;  ++i ) {
			if( i in this )
				fun.call( thisp, this[i], i, this );
		}
	};
}

if( ! Array.prototype.map ) {
	Array.prototype.map = function( fun /*, thisp*/ ) {
		var len = this.length;
		if( typeof fun != 'function' )
			throw new TypeError();
		
		var res = new Array( len );
		var thisp = arguments[1];
		for( var i = 0;  i < len;  ++i ) {
			if( i in this )
				res[i] = fun.call( thisp, this[i], i, this );
		}
		
		return res;
	};
}

if( ! Array.prototype.index ) {
	Array.prototype.index = function( field ) {
		this.by = {};
		if( field ) {
			var by = this.by[field] = {};
			for( var i = 0, n = this.length;  i < n;  ++i ) {
				var obj = this[i];
				by[obj[field]] = obj;
				obj.index = i;
			}
		}
		else {
			var by = this.by;
			for( var i = 0, n = this.length;  i < n;  ++i ) {
				var str = this[i];
				by[str] = str;
				str.index = i;
			}
		}
		return this;
	};
}

String.prototype.trim = function() {
	return this.replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' );
};

String.prototype.words = function( fun ) {
	this.split(' ').forEach( fun );
};

function S() {
	return Array.prototype.join.call( arguments, '' );
};

// hoverize.js
// Based on hoverintent plugin for jQuery

(function( $ ) {
	
	var opt = {
		slop: 7,
		interval: 200
	};
	
	function start() {
		if( ! timer ) {
			timer = setInterval( check, opt.interval );
			$(document.body).bind( 'mousemove', move );
		}
	}
	
	function clear() {
		if( timer ) {
			clearInterval( timer );
			timer = null;
			$(document.body).unbind( 'mousemove', move );
		}
	}
	
	function check() {
		if ( ( Math.abs( cur.x - last.x ) + Math.abs( cur.y - last.y ) ) < opt.slop ) {
			clear();
			for( var i  = 0,  n = functions.length;  i < n;  ++i )
				functions[i]();
		}
		else {
			last = cur;
		}
	}
	
	function move( e ) {
		cur = { x:e.screenX, y:e.screenY };
	}
	
	var timer, last = { x:0, y:0 }, cur = { x:0, y:0 }, functions = [];
	
	hoverize = function( fn, fast ) {
		
		function now() {
			fast && fast.apply( null, args );
		}
		
		function fire() {
			clear();
			return fn.apply( null, args );
		}
		functions.push( fire );
		
		var args;
		
		return {
			clear: clear,
			
			now: function() {
				args = arguments;
				now();
				fire();
			},
			
			hover: function() {
				args = arguments;
				now();
				start();
			}
		};
	}
})( jQuery );

(function( $ ) {

var opt = window.GoogleElectionMapOptions || {};
var mapplet = opt.mapplet;

GoogleElectionMap = {
	shapesReady: function( data ) {
		var abbr = data.state;
		var state = stateByAbbr( abbr );
		state.places = data.places;
		if( abbr == 'us' )
			initStateBounds( state.places );
		if( abbr == opt.state )
			loadScript( S( opt.dataUrl, 'votes/', abbr.toLowerCase(), '_', curParty.name, '.js' ), 120 );
	},
	votesReady: function( votes ) {
		var abbr = votes.state;
		var state = stateByAbbr( abbr );
		( state.votes = state.votes || {} )[curParty.name] = votes;
		stateReady( state );
	}
};

function initStateBounds( places ) {
	places.forEach( function( place ) {
		statesByName[place.name].bounds = place.bounds;
	});
}

if( opt.gadget ) {
	var p = new _IG_Prefs();
	opt.sidebarWidth = p.getInt('sidebarwidth');
	opt.mapWidth = window.innerWidth - opt.sidebarWidth ;
	opt.mapHeight = window.innerHeight - 24;
	opt.state = p.getString('state');
	opt.party = p.getString('party');
	opt.stateSelector = p.getBool('stateselector');
	opt.partySelector = p.getBool('partyselector');
	//opt.twitter = p.getBool('twitter');
	//opt.youtube = p.getBool('youtube');
}

opt.twitter = false;
opt.youtube = false;

opt.zoom = opt.zoom || 3;
opt.sidebarWidth = opt.sidebarWidth || 280;
opt.mapWidth = opt.mapWidth || 400;
opt.mapHeight = opt.mapHeight || 300;

opt.mapWidth = ( '' + opt.mapWidth ).replace( /px$/, '' );
opt.mapHeight = ( '' + opt.mapHeight ).replace( /px$/, '' );

if( opt.stateSelector == null ) opt.stateSelector = true;
if( opt.partySelector == null ) opt.partySelector = true;

//opt.twitter = opt.twitter || mapplet;
//opt.youtube = opt.youtube || mapplet;

//var imgBaseUrl = 'http://mg.to/iowa/server/images/';
var imgBaseUrl = 'http://gmaps-samples.googlecode.com/svn/trunk/elections/2008/images/icons/';

var parties = [
	{ name: 'dem', shortName: 'Democratic', fullName: 'Democratic Party', url:'http://www.iowademocrats.org/' },
	{ name: 'gop', shortName: 'Republican', fullName: 'Republican Party', url:'http://www.iowagop.net/' }
].index('name');

var q = opt.party || location.search.slice(1);
window.curParty = parties.by.name[q] || parties[ Math.random() < .5 ? 0 : 1 ];

var states = [
	{
		'abbr': 'AL',
		'name': 'Alabama',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'AK',
		'name': 'Alaska',
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '02-05', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'AZ',
		'name': 'Arizona',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'AR',
		'name': 'Arkansas',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'CA',
		'name': 'California',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'CO',
		'name': 'Colorado',
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '02-05', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'CT',
		'name': 'Connecticut',
		'votesby': 'town',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'DE',
		'name': 'Delaware',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'DC',
		'name': 'District of Columbia',
		'parties': {
			'dem': { 'date': '02-12' },
			'gop': { 'date': '02-12' }
		}
	},
	{
		'abbr': 'FL',
		'name': 'Florida',
		'parties': {
			'dem': { 'date': '01-29' },
			'gop': { 'date': '01-29' }
		}
	},
	{
		'abbr': 'GA',
		'name': 'Georgia',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'HI',
		'name': 'Hawaii',
		'parties': {
			'dem': { 'date': '02-19', 'type': 'caucus' },
			'gop': { 'date': '01-25', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'ID',
		'name': 'Idaho',
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '05-27' }
		}
	},
	{
		'abbr': 'IL',
		'name': 'Illinois',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'IN',
		'name': 'Indiana',
		'parties': {
			'dem': { 'date': '05-06' },
			'gop': { 'date': '05-06' }
		}
	},
	{
		'abbr': 'IA',
		'name': 'Iowa',
		'parties': {
			'dem': { 'date': '01-03', 'type': 'caucus' },
			'gop': { 'date': '01-03', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'KS',
		'name': 'Kansas',
		'votesby': 'district',
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '02-09', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'KY',
		'name': 'Kentucky',
		'parties': {
			'dem': { 'date': '05-20' },
			'gop': { 'date': '05-20' }
		}
	},
	{
		'abbr': 'LA',
		'name': 'Louisiana',
		'parties': {
			'dem': { 'date': '02-09' },
			'gop': { 'date': '01-22', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'ME',
		'name': 'Maine',
		'parties': {
			'dem': { 'date': '02-10', 'type': 'caucus' },
			'gop': { 'date': '02-01', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'MD',
		'name': 'Maryland',
		'parties': {
			'dem': { 'date': '02-12' },
			'gop': { 'date': '02-12' }
		}
	},
	{
		'abbr': 'MA',
		'name': 'Massachusetts',
		'votesby': 'town',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'MI',
		'name': 'Michigan',
		'parties': {
			'dem': { 'date': '01-15' },
			'gop': { 'date': '01-15' }
		}
	},
	{
		'abbr': 'MN',
		'name': 'Minnesota',
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '02-05', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'MS',
		'name': 'Mississippi',
		'parties': {
			'dem': { 'date': '03-11' },
			'gop': { 'date': '03-11' }
		}
	},
	{
		'abbr': 'MO',
		'name': 'Missouri',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'MT',
		'name': 'Montana',
		'parties': {
			'dem': { 'date': '06-03' },
			'gop': { 'date': '02-05', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'NE',
		'name': 'Nebraska',
		'parties': {
			'dem': { 'date': '02-09', 'type': 'caucus' },
			'gop': { 'date': '05-13' }
		}
	},
	{
		'abbr': 'NV',
		'name': 'Nevada',
		'parties': {
			'dem': { 'date': '01-19', 'type': 'caucus' },
			'gop': { 'date': '01-19', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'NH',
		'name': 'New Hampshire',
		'votesby': 'town',
		'parties': {
			'dem': { 'date': '01-08' },
			'gop': { 'date': '01-08' }
		}
	},
	{
		'abbr': 'NJ',
		'name': 'New Jersey',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'NM',
		'name': 'New Mexico',
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '06-03' }
		}
	},
	{
		'abbr': 'NY',
		'name': 'New York',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'NC',
		'name': 'North Carolina',
		'parties': {
			'dem': { 'date': '05-06' },
			'gop': { 'date': '05-06' }
		}
	},
	{
		'abbr': 'ND',
		'name': 'North Dakota',
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '02-05', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'OH',
		'name': 'Ohio',
		'parties': {
			'dem': { 'date': '03-04' },
			'gop': { 'date': '03-04' }
		}
	},
	{
		'abbr': 'OK',
		'name': 'Oklahoma',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'OR',
		'name': 'Oregon',
		'parties': {
			'dem': { 'date': '05-20' },
			'gop': { 'date': '05-20' }
		}
	},
	{
		'abbr': 'PA',
		'name': 'Pennsylvania',
		'parties': {
			'dem': { 'date': '04-22' },
			'gop': { 'date': '04-22' }
		}
	},
	{
		'abbr': 'PR',
		'name': 'Puerto Rico',
		'parties': {
			'dem': { 'date': '06-07' },
			//'gop': { 'date': '02-24' }
			'gop': { 'date': 'n/a' }
		}
	},
	{
		'abbr': 'RI',
		'name': 'Rhode Island',
		'parties': {
			'dem': { 'date': '03-04' },
			'gop': { 'date': '03-04' }
		}
	},
	{
		'abbr': 'SC',
		'name': 'South Carolina',
		'parties': {
			'dem': { 'date': '01-26' },
			'gop': { 'date': '01-19' }
		}
	},
	{
		'abbr': 'SD',
		'name': 'South Dakota',
		'parties': {
			'dem': { 'date': '06-03' },
			'gop': { 'date': '06-03' }
		}
	},
	{
		'abbr': 'TN',
		'name': 'Tennessee',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'TX',
		'name': 'Texas',
		'parties': {
			'dem': { 'date': '03-04' },
			'gop': { 'date': '03-04' }
		}
	},
	{
		'abbr': 'UT',
		'name': 'Utah',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'VT',
		'name': 'Vermont',
		'votesby': 'town',
		'parties': {
			'dem': { 'date': '03-04' },
			'gop': { 'date': '03-04' }
		}
	},
	{
		'abbr': 'VA',
		'name': 'Virginia',
		'parties': {
			'dem': { 'date': '02-12' },
			'gop': { 'date': '02-12' }
		}
	},
	{
		'abbr': 'WA',
		'name': 'Washington',
		'parties': {
			'dem': { 'date': '02-09', 'type': 'caucus' },
			'gop': { 'date': '02-09', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'WV',
		'name': 'West Virginia',
		'parties': {
			'dem': { 'date': '05-13' },
			'gop': { 'date': '05-13' }
		}
	},
	{
		'abbr': 'WI',
		'name': 'Wisconsin',
		'parties': {
			'dem': { 'date': '02-19' },
			'gop': { 'date': '02-19' }
		}
	},
	{
		'abbr': 'WY',
		'name': 'Wyoming',
		'parties': {
			'dem': { 'date': '03-08', 'type': 'caucus' },
			'gop': { 'date': '01-05', 'type': 'caucus' }
		}
	}
];

var stateUS = {
	'abbr': 'US',
	'name': 'United States',
	bounds: [
		[ -124.72846051, 24.54570037 ],
		[ -66.95221658, 49.38362494 ]
	]
};

var statesByAbbr = {};
var statesByName = {};
states.forEach( function( state ) {
	statesByAbbr[state.abbr] = state;
	statesByName[state.name] = state;
});

function stateByAbbr( abbr ) {
	return statesByAbbr[abbr.toUpperCase()] || stateUS;
}

function adjustHeight() {
	if( mapplet )
		_IG_AdjustIFrameHeight();
}

function loadScript( url, cache ) {
	var script = document.createElement( 'script' );
	script.type = 'text/javascript';
	script.charset = 'utf-8';
	if( opt.nocache ) {
		var seq = (new Date).getTime();
		url +='?q=' + seq;
	}
	else {
		if( cache == null ) cache = 120;
		if( cache && mapplet )
			url = _IG_GetCachedUrl( url, { refreshInterval:cache } );
	}
	//console.log( 'loadScript', url );
	script.src = url;
	script.title = 'jsonresult';
	$('head')[0].appendChild( script );
}

function htmlEscape( str ) {
	var div = document.createElement( 'div' );
	div.appendChild( document.createTextNode( str ) );
	return div.innerHTML;
}

//function atLinks( str ) {
//	var replacement = '$1@<a href="$2" target="_blank">$2</a>$3';
//	return str
//		.replace( /(^|\s)@([^\s:]+)(:)/g, replacement )
//		.replace( /(^|\s)@(\S+)(\s|$)/g, replacement );
//}

function httpLinks( str ) {
	return str.replace( /(http:\/\/\S+)/g, '<a href="$1" target="_blank">$1</a>' );
}

function percent( n ) {
	n = Math.round( n * 100 );
	return n ? n + '%' : '';
}

// calendar.google.com feed template:
// http://www.google.com/calendar/feeds/{candidate.feed}@group.calendar.google.com/public/basic

var candidates = {
	'all': [],
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
		{ 'name': 'curry', 'lastName': 'Curry', 'fullName': 'Jerry Curry', 'color': '#808040' },
		{ 'name': 'fendig', 'lastName': 'Fendig', 'fullName': 'Cap Fendig', 'color': '#408080' },
		{ 'name': 'gilbert', 'lastName': 'Gilbert', 'fullName': 'Daniel Gilbert', 'color': '#408080' },
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
};

//var preloadCandidates = candidates.all.forEach( function( candidate ) {
//	var img = new Image( 16, 16 );
//	img.src = imgUrl( candidate.name );
//	return img;
//});

var candidateNameList = [];
parties.forEach( function( party ) {
	var list = candidates[party.name];
	list.forEach( function( candidate ) {
		candidate.party = party;
		candidates.all.push( candidate );
		candidateNameList.push( candidate.name );
	});
	list.index( 'name' );
});

candidates.all.index( 'name' );

var reCandidates = new RegExp( candidateNameList.join('|'), 'g' );

function candidateIcon( name ) {
	var icon = new GIcon;
	icon.image = imgUrl( name + '-border' );
	icon.shadow = '';
	icon.iconSize = new GSize( 18, 18 );
	icon.shadowSize = new GSize( 0, 0 );
	icon.iconAnchor = new GPoint( 9, 9 );
	icon.infoWindowAnchor = new GPoint( 9, 9 );
	return icon;
}

function loadCandidateIcons() {
	parties.forEach( function( party ) {
		candidates[party.name].forEach( function( candidate ) {
			candidate.icon = candidateIcon( candidate.name );
		});
	});
}

// GAsync v2 by Michael Geary
// Commented version and description at:
// http://mg.to/2007/06/22/write-the-same-code-for-google-mapplets-and-maps-api
// Free beer and free speech license. Enjoy!

function GAsync( obj ) {
	
	function callback() {
		args[nArgs].apply( null, results );
	}
	
	function queue( iResult, name, next ) {
		
		function ready( value ) {
			results[iResult] = value;
			if( ! --nCalls )
				callback();
		}
		
		var a = [];
		if( next.join )
			a = a.concat(next), ++iArg;
		if( mapplet ) {
			a.push( ready );
			obj[ name+'Async' ].apply( obj, a );
		}
		else {
			results[iResult] = obj[name].apply( obj, a );
		}
	}
	
	//var mapplet = ! window.GBrowserIsCompatible;
	
	var args = arguments, nArgs = args.length - 1;
	var results = [], nCalls = 0;
	
	for( var iArg = 1;  iArg < nArgs;  ++iArg ) {
		var name = args[iArg];
		if( typeof name == 'object' )
			obj = name;
		else
			queue( nCalls++, name, args[iArg+1] );
	}
	
	if( ! mapplet )
		callback();
}

var partyButtons = ! opt.partySelector ? '' : [
	'<div style="margin-top:8px;">',
		'<b>Results:</b>',
		'<button style="margin-left:8px; padding:0;" id="btnDem">Democratic</button>',
		'<button style="margin-left:8px; padding:0;" id="btnRep">Republican</button>',
		//'<button style="margin-left:8px;" id="btnTest">Reload</button>',
		'</div>'
].join('');

twitterBlurb = ! opt.twitter ? '' : S(
	'<div style="padding-bottom:4px; border-bottom:1px solid #DDD; margin-bottom:4px;">',
		'We\'ve joined forces with <a href="http://twitter.com/" target="_blank">Twitter</a> and <a href="http://twittervision.com/" target="_blank">Twittervision</a> to give you instant updates on Super Tuesday. You can watch Twitter texts from across the country and send in your own updates!',
	'</div>'
);

var shortMonths = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');

function fmtDate( date ) {
	var d = date.split('-');
	if( d.length != 2 ) return date;
	return shortMonths[ d[0] - 1 ] + ' ' + (+d[1]);
}

(function() {
	var hotStates = [ 'OH', 'RI', 'TX', 'VT' ]/*.index()*/;
	var index = 0;
	function option( value, name, style ) {
		++index;
		return S( '<option value="', value, '" style="', style || '', '">', name, '</option>' );
	}
	function stateOption( state, dated ) {
		state.selectorIndex = index;
		var dates = '';
		if( dated ) {
			var dem = state.parties.dem.date, gop = state.parties.gop.date;
			dates = ' (' + ( dem == gop ? fmtDate(dem) : S( 'D:', fmtDate(dem), ', R:', fmtDate(gop) ) ) + ')';
		}
		return option( state.abbr, state.name + dates );
	}
	stateSelector = ! opt.stateSelector ? '' : S(
		'<div style="padding-bottom:4px; border-bottom:1px solid #DDD; margin-bottom:4px;">',
			'<div>',
				'Click the map for state results.',
			'</div>',
			'<div>',
				'Select a state from the list for local results:',
			'</div>',
			'<div>',
				'<select id="stateSelector">',
					option( 'us', 'Entire USA' ),
					option( '', 'March 4', 'color:#AAA; font-style:italic; font-weight:bold;' ),
					hotStates.map( function( abbr ) {
						return stateOption( statesByAbbr[abbr], false );
					}).join(''),
					option( '', 'All States', 'color:#AAA; font-style:italic; font-weight:bold;' ),
					states.map( function( state ) {
						return /*hotStates.by[state.abbr] ? '' :*/ stateOption( state, true );
					}).join(''),
				'</select>',
			'</div>',
		'</div>'
	);
})();

if( opt.projector ) writeProjectorHTML();
else if( mapplet ) writeMappletHTML();
else writeApiMapHTML();

function writeProjectorHTML() {
	document.write(
		'<style type="text/css">',
			'* { font-family: Arial,sans-serif; font-size: 10pt; }',
			'#outer {}',
			'#eventbar { display:none; }',
			'#links { margin-bottom:4px; }',
			'#news { margin-top:4px; padding:4px; }',
			'#clicknote { display:none; }',
			'h2 { font-size:11pt; margin:0; padding:0; }',
			'#loading { font-weight:normal; }',
			'.NewsHeading { padding-left:4px; }',
			'.NewsList { background-color:white; padding:2px; margin:4px; }',
			'.NewsList a { text-decoration:none; }',
			'.NewsList  a:hover { text-decoration:underline; }',
			'.NewsItem { padding:4px 2px 2px 2px; vertical-align:bottom; line-height:125%; }',
			'.favicon { width:16; height:16; float:left; padding:2px 4px 2px 2px; }',
			'#legend table { width:100%; }',
			'#legend .legendboxtd { width:7%; }',
			'#legend .legendnametd { font-size:24px; width:18%; }',
			'#legend .legendbox { height:36px; width:36px; float:left; margin-right:4px; }',
			'#legend .legendname { font-size:24px; }',
			'#legend .legendvotes { font-size:18px; }',
			'#legend .legendclear { clear:left; }',
			'#legend .legendreporting * { font-size:20px; }',
		'</style>',
		'<div id="legend" style="width: 700px; height: 140px">',
		'</div>',
		'<div id="map" style="width: 700px; height: 430px">',
		'</div>'
	);
}

function writeMappletHTML() {
	document.write(
		'<style type="text/css">',
			'* { font-family: Arial,sans-serif; font-size: 10pt; }',
			'#outer {}',
			'#links { margin-bottom:4px; }',
			'#news { margin-top:4px; padding:4px; }',
			'#clicknote { display:none; }',
			'h2 { xfont-size:14pt; margin:0; padding:0; }',
			'#loading { font-weight:normal; }',
			'.NewsHeading { padding-left:4px; }',
			'.NewsList { background-color:white; padding:2px; margin:4px; }',
			'.NewsList a { text-decoration:none; }',
			'.NewsList  a:hover { text-decoration:underline; }',
			'.NewsItem { padding:4px 2px 2px 2px; vertical-align:bottom; line-height:125%; }',
			'.favicon { width:16; height:16; float:left; margin:2px 4px 2px 2px; }',
			'.Video { margin-top:4px; }',
			'.VideoHeading { xfont-size:125%; }',
			'.VideoTitle { xfont-size:110%; }',
			'.VideoThumb { float:left; margin-right:8px; }',
			'.VideoBorder { clear:left; }',
			'#votestitle { margin:12px 0 6px 0; padding:0; }',
			'#votesattrib * { font-size:85%; }',
			'#legend table { xwidth:100%; }',
			'#legend .legendboxtd { width:1%; }',
			'#legend .legendnametd { xfont-size:24px; xwidth:18%; }',
			'#legend .legendbox { height:24px; width:24px; xfloat:left; margin-right:4px; }',
			'#legend .legendname { xfont-size:12pt; white-space:pre; }',
			'#legend .legendvotestd { text-align:right; width:5em; }',
			'#legend .legendpercenttd { text-align:right; width:2em; }',
			'#legend .legendvotes, #legend .legendpercent { xfont-size:10pt; margin-right:6px; }',
			'#legend .legendclear { clear:left; }',
			'#legend .legendreporting * { xfont-size:20px; }',
		'</style>',
		'<div id="outer">',
			'<div id="resultlist">',
			'</div>',
			'<div id="attribution" style="padding-bottom:4px; border-bottom:1px solid #DDD; margin-bottom:4px; text-align:right; display:none;">',
				'<span>AP</span>',
				'<span>/</span>',
				'<a href="http://www.boston.com/" target="_blank">Boston&nbsp;Globe</a>',
			'</div>',
			'<div style="padding-bottom:4px; border-bottom:1px solid #DDD; margin-bottom:4px;">',
				'<span style="color:red;">New!</span> ',
				'<a href="http://gmodules.com/ig/creator?synd=open&url=http://primary-maps-2008.googlecode.com/svn/trunk/map.xml" target="_blank">Get this map for your website</a>',
			'</div>',
			stateSelector,
			//twitterBlurb,
			//'<div style="padding-bottom:4px; border-bottom:1px solid #DDD; margin-bottom:4px;">',
			//	'Come back after the polls close (around 8PM EST) for live election results of all the Super Tuesday states!',
			//'</div>',
			//'<div style="padding-bottom:6px; display:none;">',
			//	'View in <a href="http://earth.google.com/" target="_blank">Google Earth</a>: ',
			//	'<a href="http://gmaps-samples.googlecode.com/svn/trunk/elections/2008/primary/', opt.state, '/earth-', opt.state, '-democrat.kml">Democratic</a>',
			//	' ',
			//	'<a href="http://gmaps-samples.googlecode.com/svn/trunk/elections/2008/primary/', opt.state, '/earth-', opt.state, '-republican.kml">Republican</a>',
			//'</div>',
			//'<div>',
			//	'<select id="lstRegions">',
			//		'<option value="">',
			//			'Zoom to a region',
			//		'</option>',
			//	'</select>',
			//	'<input type="checkbox" checked id="chkEvents" xstyle="margin-left:16px;" />',
			//	'<label for="chkEvents">Show Events</label>',
			//'</div>',
			//'<div id="links">',
			//	'<a href="http://www.desmoinesregister.com/apps/pbcs.dll/article?AID=/20071219/NEWS09/71219068" target="_blank">How the caucuses work</a>',
			//	'&nbsp;|&nbsp;',
			//	'<a href="http://www.desmoinesregister.com/apps/pbcs.dll/section?Category=caucus" target="_blank">Des Moines Register</a>',
			//'</div>',
			partyButtons,
			//'<div id="votesbar">',
			//	'<div id="votestitle">',
			//	'</div>',
				'<div id="legend">',
					'Loading&#8230;',
				'</div>',
			//'</div>',
			'<div id="videos" style="margin-top:8px;">',
			'</div>',
			'<div id="news" style="margin-top:6px;">',
			'</div>',
		'</div>'
	);
}

function writeApiMapHTML() {
	var mapWidth = opt.mapWidth ? opt.mapWidth + 'px' : '100%';
	var mapHeight = opt.mapHeight ? opt.mapHeight + 'px' : '100%';
	document.write(
		'<style type="text/css">',
			'body { margin:0; padding:0; }',
			'* { font-family: Arial,sans-serif; font-size: 10pt; }',
			'#outer {}',
			'#eventbar { display:none; }',
			'#links { margin-bottom:4px; }',
			'#news { margin-top:4px; padding:4px; }',
			'#clicknote { display:none; }',
			'h2 { font-size:11pt; margin:0; padding:0; }',
			'#loading { font-weight:normal; }',
			'.NewsHeading { padding-left:4px; }',
			'.NewsList { background-color:white; padding:2px; margin:4px; }',
			'.NewsList a { text-decoration:none; }',
			'.NewsList  a:hover { text-decoration:underline; }',
			'.NewsItem { padding:4px 2px 2px 2px; vertical-align:bottom; line-height:125%; }',
			'.favicon { width:16; height:16; float:left; padding:2px 4px 2px 2px; }',
			'#fullstate { margin-top:12px; }',
			'#fullstate table { width:700px; }',
			'#fullstate th, #fullstate td { text-align: right; background-color:#E8E8E8; padding:2px; }',
			'#fullstate th.countyname, #fullstate td.countyname { text-align:left; font-weight:bold; }',
			'.statewide * { font-weight: bold; }',
			'#votestitle { margin:12px 0 3px 0; padding:0; }',
			'#votesattrib * { font-size:85%; }',
			'#legend table { xwidth:100%; }',
			'#legend .legendboxtd { width:7%; }',
			'#legend .legendnametd { xfont-size:24px; xwidth:18%; }',
			'#legend .legendbox { height:24px; width:24px; float:left; margin-right:4px; }',
			'#legend .legendname { xfont-size:12pt; white-space:pre; }',
			'#legend .legendvotestd { text-align:right; width:5em; }',
			'#legend .legendpercenttd { text-align:right; width:2em; }',
			'#legend .legendvotes, #legend .legendpercent { xfont-size:10pt; margin-right:4px; }',
			'#legend .legendclear { clear:left; }',
			'#legend .legendreporting { margin-bottom:8px; }',
			'#legend .legendreporting * { xfont-size:20px; }',
		'</style>',
		'<table>',
			'<tr valign="top">',
				'<td>',
					'<div id="map" style="width:', mapWidth, '; height:', mapHeight, ';">',
					'</div>',
				'</td>',
				'<td valign="top" style="width:', opt.sidebarWidth, 'px;">',
					'<div id="resultlist">',
					'</div>',
					stateSelector,
					partyButtons,
					'<div id="votesbar">',
						'<div id="votestitle">',
						'</div>',
						//'<div style="font-weight:bold;">Statewide Results</div>',
						'<div id="legend">',
							'Loading&#8230;',
						'</div>',
						'<div id="results">',
							//'Roll the mouse over the map for county-by-county results.<br /><br />',
							//'Roll the mouse over the map for state-by-state results.<br />',
							//'Zoom in for county-by-county results.<br /><br />',
							//'Scroll down for statewide details',
						'</div>',
					'</div>',
				'</td>',
			'</tr>',
		'</table>',
		'<div id="fullstate">',
		'</div>'
	);
}

var feed = {
	news: 'http://news.google.com/?ned=us&topic=el&output=rss',
	video: 'http://www.youtube.com/rss/user/wmurtv/videos.rss'
};

var map;

opt.dataUrl = opt.dataUrl || 'http://primary-maps-2008-data.googlecode.com/svn/trunk/';
opt.state = opt.state || 'us';

var state = states[opt.state];

//var allEventData = [];
var eventMarkers = [];
var icons = {};

//function onEventsReady( xml ) {
//	var items = {
//		eventtitle:1, eventid:1, eventdate:1, eventtimestart:1, eventendtime:1,
//		venueid:1, venuename:1, venueaddress:1, venuecity:1, venuelat:1, venuelng:1,
//		party:1, feclist:1, etidlist:1, candnamelist:1, iscurrent:1, eventdetailslink:1
//	};
//	
//	$('marker',xml).each( function() {
//		var event = {};
//		for( var item in items ) event[item] = this.getAttribute(item);
//		event.latlng = new GLatLng( +event.venuelat, +event.venuelng );
//		event.marker = addEventMarker( event );
//		//allEventData.push( event );
//	});
//	
//	initMap();
//}

//function addEventMarker( event ) {
//	var color = { b:'white', d:'blue', r:'red' }[event.party] || 'white';
//	var icon = icons[color];
//	var marker = new GMarker( event.latlng, { icon:icons[color] } );
//	GEvent.addListener( marker, 'click', function() {
//		marker.openInfoWindowHtml( formatEvent(event), { maxWidth:500 } );
//	});
//	eventMarkers.push( marker );
//	map.addOverlay( marker );
//	return marker;
//}

function onNewsReady( xml ) {
	var videos = [];
	$('rss channel item',xml).each( function( i ) {
		if( i > 4 ) return false;
		var $item = $(this);
		var $thumb = $('thumbnail',this);
		videos.push({
			link: $('link',this).text(),
			//thumb: $thumb.attr('url'),
			//width: +$thumb.attr('width') / 2,
			//height: +$thumb.attr('height') / 2,
			title: $('title:first',this).text()
		});
		return true;
	});
	
	var html = [
		'<h2 class="VideoHeading"><a href="http://news.google.com/?ned=us&topic=el">Campaign News</a></h2>',
		videos.map( function( video ) {
			return [
				'<div class="Video">',
					//'<a class="VideoLink" href="', video.link, '" target="_blank">',
					//	'<img class="VideoThumb" src="', video.thumb, '" style="width:', video.width, 'px; height:', video.height, 'px; border:0;" />',
					//'</a>',
					'<a href="', video.link, '" target="_blank">',
						'<div class="VideoTitle">',
							video.title,
						'</div>',
					'</a>',
				'</div>',
				'<div class="VideoBorder">',
				'</div>'
			].join('');
		}).join(''),
	].join('');
	
	$('#news').html( html );
	
	adjustHeight();
}

function onVideoReady( xml ) {
	var videos = [];
	$('rss channel item',xml).each( function( i ) {
		if( i > 2 ) return false;
		var $item = $(this);
		var $thumb = $('thumbnail',this);
		if( ! $thumb.length )
			$thumb = $( this.getElementsByTagName( 'media:thumbnail' ) );
		videos.push({
			link: $('link',this).text(),
			thumb: $thumb.attr('url'),
			width: +$thumb.attr('width') / 2,
			height: +$thumb.attr('height') / 2,
			title: $('title:first',this).text()
		});
		return true;
	});
	
	var html = [
		'<h2 class="VideoHeading"><a href="http://www.youtube.com/profile_videos?user=iowacaucuses">Latest Videos</a></h2>',
		videos.map( function( video ) {
			var thumb = ! video.thumb ? '' : [
				'<a class="VideoLink" href="', video.link, '" target="_blank">',
					'<img class="VideoThumb" src="', video.thumb, '" style="width:', video.width, 'px; height:', video.height, 'px; border:0;" />',
				'</a>'
			].join('');
			return [
				'<div class="Video">',
					thumb,
					'<a href="', video.link, '" target="_blank">',
						'<div class="VideoTitle">',
							video.title,
						'</div>',
					'</a>',
				'</div>',
				'<div class="VideoBorder">',
				'</div>'
			].join('');
		}).join(''),
	].join('');
	
	$('#videos').html( html );
	
	adjustHeight();
}

function initMap() {
	//if( ! mapplet ) {
	//	GEvent.addListener( map, 'mousemove', mousemoved/*.hover*/ );
	//	//GEvent.addListener( map, 'mouseout', mousemoved.clear );
	//}
	
	//setTimeout( function() { $('#clicknote').show( 'slow' ); }, 1000 );
}

function polyMethod( name, fn ) {
	GPolygon.prototype[name] = GPolyline.prototype[name] = fn;
}

polyMethod( 'contains', function( latlng ) {
	var inside = false;
	var x = latlng.lng(), y = latlng.lat();
	var n = this.getVertexCount();
	var v = this.getVertex(n-1), x1 = v.lng(), y1 = v.lat();

	for( var i = 0;  i < n;  ++i ) {
		var v = this.getVertex(i), x2 = v.lng(), y2 = v.lat();
		
		if( ( y1 < y  &&  y2 >= y ) || ( y2 < y  &&  y1 >= y ) )
			if ( x1 + ( y - y1 ) / ( y2 - y1 ) * ( x2 - x1 ) < x )
				inside = ! inside;
		
		x1 = x2, y1 = y2;
	}
	return inside;
});

function contains( shape, xy ) {
	var inside = false;
	var x = xy[0], y = xy[1];
	var points = shape.points, n = points.length;
	var v = points[n-1], x1 = v[0], y1 = v[1];

	for( var i = 0;  i < n;  ++i ) {
		var v = points[i], x2 = v[0], y2 = v[1];
		
		if( ( y1 < y  &&  y2 >= y ) || ( y2 < y  &&  y1 >= y ) )
			if ( x1 + ( y - y1 ) / ( y2 - y1 ) * ( x2 - x1 ) < x )
				inside = ! inside;
		
		x1 = x2, y1 = y2;
	}
	return inside;
}

//function zoomToCounty( county ) {
//	// TODO: update for multiple polys
//	map.setCenter(
//	   new GLatLng( county.centroid[0], county.centroid[1] ),
//	   map.getBoundsZoomLevel( county.polygon.base.getBounds() )
//   );
//}

function initControls() {
/*
	var $lst = $('#lstRegions');
	option({ name:'', caption:'Entire State' });
	'northwest northcentral northeast southwest southcentral southeast'.words( function( name ) {
		option( regions.by.name[name] );
	});
	
	function option( region ) {
		var opt = document.createElement('option');
		opt.innerHTML = region.caption;
		opt.value = region.name;
		$lst.append( opt );
	}
	
	$lst.bind( 'change', function() {
		zoomRegion( regions.by.name[this.value] );
	});
*/
/*
	$('#chkEvents').bind( 'click', function() {
		map.closeInfoWindow();
		var method = this.checked ? 'show' : 'hide';
		eventMarkers.forEach( function( marker ) {
			marker[method]();
		});
	});
*/
}

//function zoomRegion( region ) {
//	map.closeInfoWindow();
//	if( ! region  &&  state ) {
//		var zoom = state.zoom;
//		map.setCenter( new GLatLng( zoom[0], zoom[1] ), zoom[2] );
//		//selectRegion();
//	}
//	else if( ! mapplet ) {
//		var center = new GLatLng( 37.0625, -95.677068 );
//		map.setCenter( center, opt.zoom );
//		//GAsync( region.polygon.base, 'getBounds',
//		//	function( bounds ) {
//		//		GAsync( map, 'getBoundsZoomLevel', [ bounds ],
//		//			function( zoom ) {
//		//				//selectRegion( region );
//		//				var center = pointLatLng( region.centroid );
//		//				map.setCenter( center, zoom );
//		//			});
//		//	});
//	}
//}

function pointLatLng( point ) {
	return new GLatLng( point[0], point[1] );
}

function formatEvent( event ) {
	var href = event.eventdetailslink;
	var link = ! href ? '' : [
		'<div style="margin-top:6px;">',
			'<a href="', event.eventdetailslink, '" target="_blank">Event details&#8230;</a>',
		'</div>'
	].join('');
	var names = event.candnamelist.replace( /,+$/, '' ).replace( /, /, ',' ).replace( /,/, ', ' ).trim();

	var who = ! names ? '' : [
		'<tr>',
			'<td><b>Candidate:&nbsp;</b></td>',
			'<td>', candidateIcons(names,'width:16; height:16; float:left; margin:2px 4px 2px 2px;'), names, '</td>',
		'</tr>'
	].join('');
	
	var where = event.venuename == event.venuecity ? '' : [
		'<tr>',
			'<td><b>Where:&nbsp;</b></td>',
			'<td>', event.venuename, '</td>',
		'</tr>'
	].join('');

	return [
		'<div style="margin-top:8px;">',
			'<div style="font-size: 120%; font-weight: bold; margin-bottom:6px;">', event.eventtitle, '</div>',
			'<table>',
				who,
				where,
				'<tr>',
					'<td><b>Address:&nbsp;</b></td>',
					'<td>', ( event.venueaddress ? event.venueaddress + ', ' : '' ), event.venuecity, '</td>',
				'</tr>',
				'<tr>',
					'<td><b>When:&nbsp;</b></td>',
					'<td>', event.eventdate, ' at ', event.eventtimestart, '</td>',
				'</tr>',
			'</table>',
			link,
		'</div>'
	].join('');
}

/*
 function getEvents(regionIdx) {
	var poly = regions[regionIdx].polygon.base;
	var html = '<div style="width:350px;height:200px;overflow:auto;font-size:12px;">';
	for(var i=0; i<allEventData.length; i++) {
		if (poly.Contains(allEventData[i].latlng))
			html += formatEvent(allEventData[i]);
	}
	html += '</div>';
	return html;
}
*/

//function createNewsMarker(latlng, html, regionIdx) {
//	var marker = new GMarker( latlng, { icon:icon08 } );
//	
//	GEvent.addListener(marker, "click", function() {
//		var tabs = [];
//		var eventTab = new GInfoWindowTab('News', html);
//		tabs.push(eventTab);
//		/*
//		var eventsHTML = getEvents(regionIdx);
//		if (eventsHTML)
//			tabs.push(new GInfoWindowTab('Events', eventsHTML));
//		*/
//		tabs.push(new GInfoWindowTab('Results', ''));
//		tabs.push(new GInfoWindowTab('Videos', ''));
//		marker.openInfoWindowTabsHtml(tabs);
//	});
//	
//	return marker;	
//}

function randomColor() {
	return '#' + hh() + hh() + hh();
}

function randomGray() {
	var h = hh();
	return '#' + h + h + h;
}

function hh() {
	var xx = Math.floor( Math.random() *128 + 96 ).toString(16);
	return xx.length == 2 ? xx : '0'+xx;
}

function stateReady( state ) {
	if( ! map ) return;
	map.clearOverlays();
	//$('script[title=jsonresult]').remove();
	//if( json.status == 'later' ) return;
	var bounds = state.bounds;
	if( bounds ) {
		//var latpad = ( bounds[1][1] - bounds[0][1] ) / 20;
		//var lngpad = ( bounds[1][0] - bounds[0][0] ) / 20;
		//var latlngbounds = new GLatLngBounds(
		//	new GLatLng( bounds[0][1] - latpad, bounds[0][0] - lngpad ),
		//	new GLatLng( bounds[1][1] + latpad, bounds[1][0] + lngpad )
		//);
		var latlngbounds = new GLatLngBounds(
			new GLatLng( bounds[0][1], bounds[0][0] ),
			new GLatLng( bounds[1][1], bounds[1][0] )
		);
		GAsync( map, 'getBoundsZoomLevel', [ latlngbounds ], function( zoom ) {
			map.setCenter( latlngbounds.getCenter(), zoom );
			polys();
		});
	}
	else {
		polys();
	}
	function polys() {
		// Let map display before drawing polys
		setTimeout( function() {
			showStateSidebar( state, curParty );
			if( opt.tileUrl )
				loadTiles( state, curParty );
			else
				showPolys( state, curParty );
		}, 250 );
	}
}

function showVotes( json, party ) {
	return;
	map.clearOverlays();
	$('script[title=jsonresult]').remove();
	if( json.status == 'later' ) return;
	showState( json, party );
	showCounties( json, party );
	adjustHeight();
}

function showState( json, party ) {
	if( opt.projector ) showStateProjector( json, party );
	//else if( mapplet ) showStateSidebar( json, party );
	//else showStateTable( json, party );
	else showStateSidebar( json, party );
}

function formatNumber( nStr ) {
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function showStateProjector( json, party ) {
	var state = json.state, tallies = state.candidates, precincts = state.precincts;
	tallies.index('name');
	var rows = [];
	addRow( 0, 3 );
	addRow( 4, 7 );
	
	var html = [
		'<table>',
			rows.join(''),
		'</table>',
		'<div class="legendreporting">',
			'<table>',
				'<tr>',
					'<td style="text-align:left;">',
						'LIVE: Leading candidates by county',
					'</td>',
					'<td style="text-align:right;">',
						precincts.reporting, ' of ', precincts.total, ' precincts reporting',
					'</td>',
				'</tr>',
		'</table>',
			'<div style="clear:both;>',
			'</div>',
		'</div>'
	].join('');
	
	$('#legend').html( html );
	
	function addRow( start, end ) {
		var cols = [];
		for( var i = start;  i <= end;  ++i ) {
			var candidate = candidates[party][i];
			var tally = tallies.by.name[candidate.name];
			cols.push( [
				'<td class="legendboxtd">',
					'<div class="legendbox" style="border:1px solid #888888; background-color:', candidate.color, ';">',
						'&nbsp;',
					'</div>',
				'</td>',
				'<td class="legendnametd">',
					'<div class="legendname">',
						candidate.fullName,
					'</div>',
					'<div class="legendvotes">',
						formatNumber(tally.votes),
					'</div>',
					'<div class="legendclear">',
					'</div>',
				'</td>'
			].join('') );
		}
		
		rows.push( [
			'<tr>',
				cols.join(''),
			'</tr>'
		].join('') );
	}
}

function showStateSidebar( state, party ) {
	var html = '';
	var totals = state.votes[party.name].totals;
	if( totals ) {
		var precincts = totals.precincts;
		var tallies = totals.votes;
		tallies.index('name');
		var rows = [];
		var cands = candidates[party.name];
		addRows();
		
		var html = [
			'<table>',
				rows.join(''),
			'</table>',
			'<div class="legendreporting">',
				precincts.reporting, ' of ', precincts.total, ' precincts reporting',
			'</div>'
		].join('');
	}	
	$('#legend').html( html );
	adjustHeight();
	
	function addRows() {
		var cols = [];
		tallies.forEach( function( tally ) {
			var candidate = candidates.all.by.name[tally.name];
			rows.push( [
				'<tr>',
					'<td class="legendvotestd">',
						'<div class="legendvotes">',
							formatNumber(tally.votes),
						'</div>',
					'</td>',
					'<td class="legendpercenttd">',
						'<div class="legendpercent">',
							percent( tally.votes / state.total ),
						'</div>',
					'</td>',
					'<td class="legendboxtd">',
						'<div class="legendbox" style="border:1px solid #888888; background-color:', candidate.color, ';">',
							'&nbsp;',
						'</div>',
					'</td>',
					'<td class="legendnametd">',
						'<div class="legendname">',
							candidate.fullName,
						'</div>',
					'</td>',
				'</tr>'
			].join('') );
		});
	}
}

function showStateTable( json, party ) {
	var state = json.state, tallies = state[party], precincts = state.precincts;
	tallies.index('name');
	var cands = candidates[party];
	
	var html = [
		'<table>',
			'<thead>',
				header(),
			'</thead>',
			'<tbody>',
				stateRow(),
				countyRows(),
			'</tbody>',
		'</table>',
		'<div class="legendreporting">',
			precincts.reporting, ' of ', precincts.total, ' precincts reporting',
		'</div>'
	].join('');
	
	$('#fullstate').html( html );
	
	function header() {
		return [
			'<th class="countyname"></th>',
			cands.map( function( candidate ) {
				return [ '<th>', candidate.lastName, '</th>' ].join('');
			}).join(''),
		].join('');
	}
	
	function countyRows() {
		return counties.map( function( county ) {
			return row( county );
		}).join('');
	}
	
	function stateRow() {
		return row( null, 'Entire State', 'statewide' );
	}
	
	function row( county, name, clas ) {
		var tallies = ( county ? json.counties[county.name] : json.state )[party];
		if( ! tallies ) return '';
		tallies.index('name');
		return [
			'<tr class="', clas, '">',
				'<td class="countyname">', name || county.name, '</td>',
				cands.map( function( candidate ) {
					var tally = tallies.by.name[candidate.name] || { votes:0 };
					return [ '<td>', formatNumber(tally.votes), '</td>' ].join('');
				}).join(''),
			'</tr>'
		].join('');
	}
}

function showPolys( state, party ) {
	var tallies = state.votes && state.votes[party.name] || {};
	state.places.forEach( function( place ) {
		//place.color = randomColor();
		place.color = randomGray();
		//place.opacity = Math.random();
		place.opacity = .15;
		
		//place.color = 'black';
		//place.opacity = 0;
		
		if( tallies && tallies.locals ) {
			var tally = tallies.locals[place.name];
			if( tally ) {
				place.precincts = tally.precincts;
				//place.total = tally.total;
				var leader = tally.votes && tally.votes[0];
				if( leader ) {
					var votes = leader.votes;
					var candidate = candidates[party.name].by.name[leader.name];
					var icon = candidate.icon;
					
					//if( ! opt.projector  &&  ! mapplet ) {
					//	var marker = new GMarker( new GLatLng( place.centroid[0], place.centroid[1] ), { icon:icon } );
					//	map.addOverlay( marker );
					//}
					
					place.color = candidate.color;
					place.opacity = place.precincts.reporting / place.precincts.total * .7;
				}
			}
		}
		
		place.shapes.forEach( function( shape ) {
			var points = shape.points;
			var vertices = shape.vertices = [];
			// Old fashioned loop for speed
			for( var i = 0, n = points.length;  i < n;  ++i ) {
				var point = points[i];
				vertices.push( new GLatLng( point[1], point[0] ) );
			}
			
			var border = '#000080';
			shape.polygon = {
				base: new GPolygon( vertices, border, 1, .5, place.color, place.opacity )
			};
			
			//if( json ) {
			//	shape.polygon = {
			//		base:
			//			opt.projector ? new GPolygon( vertices, border, 1, .5, color, .9 )  :
			//			votes ? new GPolygon( vertices, border, 1, .5, color, .7 ) :
			//			new GPolygon( vertices, border, 1, .5 ) //,
			//		//select: new GPolygon( vertices, color2, 1, .75, color2, .15 )
			//	};
			//}
			//else {
			//	shape.polygon = {
			//		base: new GPolygon( vertices, border, 1, .5, place.color, .8 )
			//	};
			//}
			shape.polygon.base.$_place_$ = { parent:state, place:place };
			map.addOverlay( shape.polygon.base );
			//GEvent.addListener( shape.polygon.base, 'click', function() {
			//	map.openInfoWindowHtml(
			//		pointLatLng( shape.centroid ),
			//		voteBalloon( place ),
			//		{ maxWidth:300 } );
			//});
		});
	});
	
	initMap();
}

function voteBalloon( county ) {
	return [
		'<div style="font-size:10pt;">',
			countyTable( county, null, true ),
		'</div>'
	].join('');
}

function makeIcons() {
	'red white blue'.words( function( color ) {
		icons[color] = makeColorIcon( color );
	});
	loadCandidateIcons();
}

function makeColorIcon( color ) {
	var icon = new GIcon;
	icon.image = 'http://www.google.com/intl/en_us/mapfiles/ms/icons/' + color + '-dot.png';
	//icon.shadow = '';
	icon.iconSize = new GSize( 32, 32 );
	//icon.shadowSize = new GSize( 0, 0 );
	icon.iconAnchor = new GPoint( 16, 32 );
	icon.infoWindowAnchor = new GPoint( 16, 0 );
	return icon;
}

//Json = {
//	democratResults: function( json ) { showVotes( json, 'democrat' ); },
//	republicanResults: function( json ) { showVotes( json, 'republican' ); }
//};

function setStateByAbbr( abbr ) {
	setState( stateByAbbr(abbr) );
}

function setStateByName( name ) {
	setState( statesByName[name] );
}

function setState( state ) {
	if( ! state ) return;
	var select = $('#stateSelector')[0];
	select && ( select.selectedIndex = state.selectorIndex );
	opt.state = state.abbr.toLowerCase();
	loadState();
}

function openInfo( place ) {
	if( place.parent.abbr == 'US' ) {
		var state = statesByName[place.place.name];
	}
	else {
	}
	map.openInfoWindowHtml(
		pointLatLng( shape.centroid ),
		voteBalloon( place ),
		{ maxWidth:300 } );
}

function load() {
	if( mapplet ) {
		map = new GMap2;
		//zoomRegion();
	}
	else {
		if( ! GBrowserIsCompatible() ) return;
		map = new GMap2( $('#map')[0] );
		//zoomRegion();
		map.enableContinuousZoom();
		map.enableDoubleClickZoom();
		map.enableGoogleBar();
		map.enableScrollWheelZoom();
		//map.addControl( new GLargeMapControl() );
		map.addControl( new GSmallMapControl() );
	}
	
	GEvent.addListener( map, 'click', function( overlay, latlng ) {
		var place = overlay ? overlay.$_place_$ : hittest( latlng );
		//alert( place.place.name );
		//openInfo( place );
	});
	
	makeIcons();
	
	//if( mapplet ) showVotes();
	
	//GEvent.addListener( map, 'click', function( overlay, latlng ) {
	//	//marker.openInfoWindowHtml( formatEvent(event), { maxWidth:500 } );
	//});
	
	var testdata = false;
	if( location.search.slice(1) == 'test' )
		testdata = true;
	
	loadResults( curParty );
	//showCounties();
	
	if( mapplet ) {
		//download( feed.video, onVideoReady );
		download( feed.news, onNewsReady );
		//loadYouTubeMap();
	}
	
	//loadVotes();
	if( opt.twitter ) loadTwitter();
	
	//loadTiles();
	//$('#btnTest').click( function() {
	//	loadTiles();
	//	return false;
	//});

	$('#btnDem').click( function() {
		loadResults( parties.by.name['dem'] );
		return false;
	});

	$('#btnRep').click( function() {
		loadResults( parties.by.name['gop'] );
		return false;
	});
	
	$('#stateSelector').change( function() {
		var value = this.value.toLowerCase();
		if( ! value ) {
			value = 'us';
			this.selectedIndex = 0;
		}
		opt.state = value;
		loadState();
	});
	
	setParty = function( party ) {
		if( party != curParty ) loadResults( party );
	}
	
	function loadResults( party ) {
		curParty = party;  // vs. opt.party?
		//map.clearOverlays();
		var attrib = location.href.match( /boston\.com/ ) ? '' : [
			'<span>AP</span>',
			'<span>/</span>',
			'<a href="http://www.boston.com/" target="_blank">Boston&nbsp;Globe</a>'
		].join('');
		$('#votestitle').html( [
			'<table  cellspacing="0" style="width:100%;">',
				'<tr>',
					'<td style="text-align:left;">',
						//'<b>', party.fullName, '</b>',
						'<b>Total voting results</b>',
					'</td>',
					'<td id="votesattrib" style="text-align:right;">',
						attrib,
					'</td>',
				'</tr>',
			'</table>'
		].join('') );
		$('#legend').html( 'Loading&#8230;' );
		setStateByAbbr( opt.state );
		//loadVotes( opt.state );
		
		//loadScript( 'http://mg.to/iowa/server/' + q + '_results.js' );
		//if( testdata )
		//	loadScript( 'http://gigapad/iowa/server/test.' + party + '_results.js' );
		//else
			//loadScript( 'http://gmaps-samples.googlecode.com/svn/trunk/elections/iowa/caucus/live/' + party.name + '_results.js' );
		//var kmlBaseUrl = 'http://mg.to/', opt.state, '/';
		//var kmlBaseUrl = 'http://gmaps-samples.googlecode.com/svn/trunk/elections/2008/primary/', opt.state, '/';
		//var kml = new GGeoXml( kmlBaseUrl + 'maps-', opt.state, '-' + party.name + '.kml?t=' + new Date().getTime() );
		//map.addOverlay( kml );
		//GEvent.addListener( kml, 'click', function( overlay, latlng ) {
		//	console.log( 'kml', overlay, latlng );
		//	//marker.openInfoWindowHtml( formatEvent(event), { maxWidth:500 } );
		//});
	}
	
	
	//initControls();
	adjustHeight();
}

var mousemoved = function( latlng ) {
	//$('#test').html( latlng.lng() + ' : ' + latlng.lat() );
	
/*
	for( var i = 0, n = regions.length;  i < n;  ++i ) {
		var region = regions[i];
		if( region.polygon.base.contains( latlng ) ) {
			//$('#test').css({ color: region.color });
			break;
		}
	}
	
	if( i == n ) i = -1;
	region = regions[i];
	
	selectRegion( region );
*/
	
	// Old fashioned loops for speed
	for( var i = 0, nI = counties.length;  i < nI;  ++i ) {
		var county = counties[i];
		var shapes = county.shapes;
		for( var j = 0, nJ = shapes.length;  j < nJ;  ++j ) {
			if( shapes[j].polygon.base.contains( latlng ) ) {
				//$('#test').css({ color: region.color });
				$('#results').html( countyTable( county ) );
				return;
			}
		}
	}
}

function hittest( latlng ) {
	var state = stateByAbbr( opt.state );
	if( opt.state == 'us' ) {
		return test( state );
	}
	else {
		return test( state ) || test( stateUS );
	}
	
	function test( entity ) {
		// Old fashioned loops for speed
		var places = entity.places;
		for( var i = 0, nI = places.length;  i < nI;  ++i ) {
			var place = places[i];
			var shapes = place.shapes;
			for( var j = 0, nJ = shapes.length;  j < nJ;  ++j )
				if( contains( shapes[j], [ latlng.lng(), latlng.lat() ] ) )
					return { parent:entity, place:place };
		}
		return null;
	}
}

function following() {
	var chk = $('#chkFollow')[0];
	return ! chk  ||  chk.checked;
}

function loadState() {
	var abbr = opt.state;
	var state = stateByAbbr( abbr );
	if( state.data ) {
		//console.log( 'state ready', state.name );
		stateReady( state.data );
	}
	else {
		//console.log( 'loading state', abbr );
		loadScript( S( opt.dataUrl, 'shapes/coarse/', abbr.toLowerCase(), '.js' ), 120 );
	}
}

//function loadVotes() {
//	return;
//		//loadScript( [ opt.dataUrl, 'elections/2008/primary/states/', opt.state, '/results_', party.name, '.js' ].join('') );
//		
//	var contentBase = window.contentBase || 'http://primary-maps-2008-data.googlecode.com/svn/trunk/miniresults/';
//
//	var party = ( Math.random() < .5 ? 'dem' : 'gop' );
//	
//	setTimeout( reload, 1 );
//	
//	refresh = function( p) {
//		$('#chkFollow')[0].checked = false;
//		loadParty( p );
//	}
//	
//	changePartyIfFollowing = function( p ) {
//		if( following() )  loadParty( p );
//	}
//	
//	loadParty = function( p ) {
//		party = p || party;
//		reload();
//	}
//	
//	function reload() {
//		var url = contentBase + 'miniresults-map-' + party + '.html';
//		_IG_FetchContent( url, function( html ) {
//			var follow = following();
//			$('#resultlist').html( html );
//			$('#chkFollow')[0].checked = follow;
//			$('#spanFollow').css({ display:'inline' });
//			$('#attribution').show();
//			adjustHeight();
//			setTimeout( reload, 120000 ); 
//		},
//		{
//			refreshInterval: 120
//		});
//	}
//}

//var tileSeq = new Date().getTime();
var tileLayerOverlay;
function loadTiles( state, party ) {
	if( tileLayerOverlay ) map.removeOverlay( tileLayerOverlay );
	
	//var base = opt.tileUrl || ( 'http://padlet/election-tiles/election-tiles-1/tiles/' + state.abbr.toLowerCase() + '/' );
	//base = 'http://gmodules.com/ig/proxy?url=http://mg.to/elections/tiles/';
	//base = 'http://padlet/elections/2008/shapes/tiles-county/';
	//base = 'http://gmodules.com/ig/proxy?url=http://primary-maps-2008-test.googlecode.com/svn/trunk/tiles/us/tiles/';
	//base = 'http://gmodules.com/ig/proxy?url=http://primary-maps-2008-test.googlecode.com/svn/trunk/tiles/us/tiles/';
	//base = 'http://primary-maps-2008-test.googlecode.com/svn/trunk/tiles/us/tiles/';
	//base = 'http://primary-maps-2008-test.googlecode.com/svn/trunk/tiles/us/tiles-75/';
	
	tileLayerOverlay = new GTileLayerOverlay(
		new GTileLayer( null, 1, 1, {
			tileUrlTemplate: opt.tileUrl + state.abbr.toLowerCase() + '/tile-{Z}-{Y}-{X}.png', 
			isPng:true,
			opacity:1.0
		})
	);
	
	map.addOverlay( tileLayerOverlay );
}

function countyName( county ) {
	var name = county.name.replace( / County$/, '' );
	if( ! name.match(/ City/) )
		name += ' ' + state.votesby;
	return name + ', ' + state.name;
}

function countyTable( county, party, balloon ) {
	//var fontsize = balloon ? 'font-size:10pt;' : '';
	var fontsize = 'font-size:10pt;';
	var pad = balloon ? '8px' : '4px';
	party = party || opt.party;
	var lines = [];
	if( county.total ) {
		var tallies = county.tallies;
		tallies.forEach( function( tally ) {
			var candidate = candidates.all.by.name[tally.name];
			lines.push( [
				'<tr>',
					'<td style="', fontsize, 'text-align:right; width:5em; padding-right:', pad, ';">',
						'<div>',
							formatNumber(tally.votes),
						'</div>',
					'</td>',
					'<td style="', fontsize, 'text-align:right; width:2em; padding-right:', pad, ';">',
						'<div>',
							percent( tally.votes / county.total ),
						'</div>',
					'</td>',
					'<td style="width:1%;">',
						'<div style="width:24px; height:24px; margin:0 4px 2px 0; border:1px solid #888888; background-color:', candidate.color, ';">',
							'&nbsp;',
						'</div>',
					'</td>',
					//'<td style="', fontsize, 'padding-right:8px;">',
					//	'<img class="favicon" src="', imgUrl(tally.name), '" />',
					//'</td>',
					'<td style="', fontsize, 'xpadding-right:8px; white-space:pre;">',
						'<div>',
							candidate.fullName,
						'</div>',
					'</td>',
				'</tr>'
			].join('') );
		});
	}
	else if( ! county.precincts ) {
		//lines.push( '<tr><td>' + county.name + ' residents vote in a nearby town.</td></tr>' );
	}
	else {
		lines.push( '<tr><td>No votes reported</td></tr>' );
	}
	
	var wikilink = ! balloon ? '' : [
		'<a href="http://en.wikipedia.org/wiki/',
				countyName(county).replace( / /g, '_' ),
				'" target="_blank">',
			'County information',
		'</a>'
	].join('');
	
	return [
		'<div style="', fontsize, 'font-weight:bold;">', countyName(county), '</div>',
		'<div>',	wikilink, '</div>',
		'<table style="margin-top:8px;">', lines.join(''), '</table>'
	].join('');
}

//if( ! mapplet ) mousemoved = hoverize( mousemoved );

/*
function selectRegion( region ) {
	if( region == regions.selected ) return;
	if( regions.selected )
		map.removeOverlay( regions.selected.polygon.select );
	regions.selected = region;
	if( region )
		map.addOverlay( region.polygon.select );
	showRegionNews( region );
}
*/

/*
function showRegionNews( region ) {
	if( ! region ) {
		$('#news')
			.css({ backgroundColor:'inherit' })
			.html( [
				'<h2 class="NewsHeading">',
					mapplet ? 'Click the map for regional news' : 'Rest the mouse over the map for regional news',
				'</h2>'
			].join('') );
		return;
	}
	
	var news = region.news;
	
	var list = [];
	news && news.forEach( function( item ) {
		list.push( [
			'<div class="NewsItem">',
				candidateIcons( item.title ),
				'<a href="', item.link, '" target="_blank">', item.title, '</a>',
			'</div>'
		].join('') );
	});
	
	$('#news')
		.css({ backgroundColor:region.solid })
		.html( [
			'<h2 class="NewsHeading">',
				region.caption, ' Iowa News',
			'</h2>',
			'<div class="NewsList">',
				list.join(''),
			'</div>'
		].join('') );
	
	adjustHeight();
}
*/

function imgUrl( name ) {
	return imgBaseUrl + name + '.png';
}

function candidateIcons( text, style ) {
	var names = text.toLowerCase().match(reCandidates) || [ 'generic' ];
	var icons = names.map( function( name ) {
		return [
			'<img ',
				style != null ? 'style="' + style + '"' : 'class="favicon"',
				' src="', imgUrl(name), '" />'
		].join('');
	});
	
	return icons.join('');
}

function download( url, ready ) {
	if( mapplet ) {
		_IG_FetchXmlContent( url, ready );
	}
	else {
		//GDownloadUrl( 'proxy.php?url=' + encodeURIComponent(url), function( data ) {
		//	ready( GXml.parse(data) );
		//});
	}
}

$(window).bind( 'load', load ).bind( 'onunload', GUnload );

function loadTwitter() {
	var url = 'http://primary-maps-2008-data.googlecode.com/svn/trunk/tweets/tweets.js?t=' + new Date().getTime();
	_IG_FetchContent( url, function( t ) {
		window.tweets = eval( '(' + t + ')' );
		//var list = [], markers = [];
		//tweets.forEach( function( tweet ) {
		//	markers.push();
		//});
		showTweet();
	});
}

function showTweet() {
	var tweet = tweets.shift();
	if( tweet )
		addTweetMarker( tweet );
	else
		loadTwitter();
}

var demRE = /hillary|clinton|barack|obama|democrat/i;
var gopRE = /huckabee|mccain|paul|romney|gop|republican/i;

var tweetMarker;
function addTweetMarker( tweet ) {
	//debugger;
	//if( tweetMarker ) {
	//	//map.closeInfoWindow();
	//	map.removeOverlay( tweetMarker );
	//	tweetMarker = null;
	//}
	
	//var dem = tweet.message.match( demRE );
	//var gop = tweet.message.match( gopRE );
	//if( dem && ! gop )
	//	changePartyIfFollowing( 'dem' );
	//else if( gop && ! dem )
	//	changePartyIfFollowing( 'gop' );
	
	var latlng = new GLatLng( tweet.lat, tweet.lon );
	if( ! tweetMarker ) {
		tweetMarker = new GMarker( latlng/*, { icon:icons[color] }*/ );
		map.addOverlay( tweetMarker );
	}
	else {
		if( mapplet )
			tweetMarker.setPoint( latlng );
		else
			tweetMarker.setLatLng( latlng );
	}
	//marker.openInfoWindowHtml( tweetBubble(tweet) );
	var bubble = tweetBubble(tweet);
	tweetMarker.openInfoWindowHtml( bubble, { maxWidth:300, disableGoogleLinks:true } );
	
	setTimeout( showTweet, 15000 );
}

function tweetBubble( tweet ) {
	var img = ! tweet.image ? '' : S(
		'<img ',
			'style="border:1px solid black; float:left; width:48px; height:48px; margin:0 6px 6px 0; vertical-align:top;" ',
			'src="', tweet.image || '', '" />'
	);
	var author = ! tweet.author || tweet.author == tweet.user ? '' : S( '<div>', htmlEscape(tweet.author), '</div>' );
	return S(
		'<div style="font-family: Arial,sans-serif; font-size: 10pt;">',
			img,
			'<div style="font-weight:bold;">',
				'<a target="_new" href="http://twitter.com/', htmlEscape(tweet.user), '">', htmlEscape(tweet.user), '</a>',
			'</div>',
			author,
			'<div>',
				htmlEscape( tweet.where || '' ),
			'</div>',
			'<div style="display: inline;">',
				httpLinks( htmlEscape(tweet.message) ),
				//atLinks( httpLinks( htmlEscape(tweet.message) ) ),
			'</div>',
			//'<div id="statusupdated">less than a minute ago in WWW</div>
		'</div>'
	);
}

//function loadYouTubeMap() {
//	
//	var contestID = 18;
//	var vlist = null;
//	var temp_vlist = null;
//	var vOfCount = 0;
//	var tabs = null;
//	var selectedVid = 0;
//	var user_vid = "";
//	var user_id = "";
//	var _json_with_no_cache = 1;
//	var timerHandle = 0;
//	var page = 1;
//	
//	
//	var overlayscleared = 0;
//	var marker = null;
//	
//	var DEFAULT_MARKER_POINT = new GLatLng(38.496593,-98.338623);//new GLatLng(37.4228, -122.085)
//	var DEFAULT_BIG_ZOOM = 4;
//	var DEFAULT_SMALL_ZOOM = 6;
//
//	
//	var gicons = [
//		new GIcon(G_DEFAULT_ICON, _IG_GetImageUrl("http://contests.labpixies.com/gadget/super_tue/images/1.png")),
//		new GIcon(G_DEFAULT_ICON, _IG_GetImageUrl("http://contests.labpixies.com/gadget/super_tue/images/2.png")),		
//		new GIcon(G_DEFAULT_ICON, _IG_GetImageUrl("http://contests.labpixies.com/gadget/super_tue/images/3.png")),
//		new GIcon(G_DEFAULT_ICON, _IG_GetImageUrl("http://contests.labpixies.com/gadget/super_tue/images/4.png"))	
//	];
//	
//	for(var i=0; i < gicons.length ; i++){
//		var tmp = gicons[i];
//		tmp.iconSize = new GSize(22,21);
//		tmp.shadowSize = new GSize(0,0);
//	}
//	
//	var gmarkers = [];
//	var gmarkers_htmls = [];
//	var gmarkers_ids = [];
//	var gmarkers_idx = 0;
//	
//	var url = "http://contests.labpixies.com/get_videos/?cid="+contestID+"&v_phase=0";
//	_IG_FetchContent(url, parseResponse, { refreshInterval: (60 * 1) });
//	
//	function parseResponse(response){
//		
//		if (response == null || typeof(response) != "string") {
//			_gel("mainmap").innerHTML = "Temporary unavailable, please try again in a few seconds";
//			return;
//		}
//		
//		videos_data = eval("("+response+")");
//		
//		
//		vlist = videos_data.list;
//		vlist.splice(vlist.length-1,1);
//		
//		if(vlist.length == 0){
//			//_gel("mainmap").innerHTML = "No video available, please try again in a few seconds";
//			//return;
//		}
//		
//		vlist.sort( randOrd );
//		vOfCount = vlist.length;
//		
//		
//		loadMainMap();
//		
//	}
//	
//	
//	function loadMainMap() {
//		
//		var bounds = new GLatLngBounds();
//		
//console.log('creating markers ' + vlist.length);		
//		for (var i=0; i<vlist.length && i<50; i++) {
//console.log('creating marker ' +i);		
//			var latlng = vlist[i].geo.split("s");
//			var point = new GLatLng(latlng[0], latlng[1]);
//			var _marker = createCustomMarker(point, vlist[i].v_name, vlist[i].yt_id, vlist[i].cat);
//			//map.addOverlay(_marker);
//			bounds.extend(point);
//		}
//		
//		
//		//map.setCenter(bounds.getCenter(), map.getBoundsZoomLevel(bounds));
//		//map.setCenter(new GLatLng("38.548165","-99.492187"), 4);
//		
//console.log('adding markers');		
//		for (var i = 0; i < gmarkers.length; i++) {
//			map.addOverlay(gmarkers[i]);
//		}
//console.log('done adding markers');		
//		setTimeout("gmarkers_click(0);",2000);
//	}
//	
//	function createCustomMarker(point,name,yt_id,category) {
//        var html = '<table><tr><td width="230" height="20" class="smallBlueText">'+name+'</td></tr><tr><td width="230" height="190" id="testCont">&nbsp;</td></tr></table>';
//		
//		var _marker = new GMarker(point,gicons[category-1]);
//        GEvent.addListener(_marker, "click", function() {
//			_marker.openInfoWindowHtml(html);
//			var curl = ("http://www.youtube.com/v/"+yt_id+"&rel=0&autoplay=1&border=0");
//			_LP_EmbedFlash(curl, "testCont", {width: 230,height: 190,wmode:'transparent'});
//			gadgetTracker._trackEvent('map-playVideo',name);
//			_gel("report_pixel").src = "http://contests.labpixies.com/view.php?vid="+yt_id+"&cont_id="+contestID+"&rand="+Math.round(Math.random()*100000);
//        });
//        
//		GEvent.addListener(_marker, "infowindowbeforeclose", function() {
//			_gel("testCont").innerHTML = "";
//        });
//		
//        gmarkers[gmarkers_idx] = _marker;
//        gmarkers_htmls[gmarkers_idx] = html;
//		gmarkers_ids[gmarkers_idx] = yt_id;
//		
//        gmarkers_idx++;
//        return _marker;
//    }
//	
//	
//	function gmarkers_click(_idx) {
//		gmarkers[_idx].openInfoWindowHtml(gmarkers_htmls[_idx]);
//		var curl = ("http://www.youtube.com/v/"+gmarkers_ids[_idx]+"&rel=0&autoplay=1&border=0");
//		_LP_EmbedFlash(curl, "testCont", {width: 230,height: 190,wmode:'transparent'});
//		gadgetTracker._trackEvent('map-playVideo',gmarkers_ids[_idx]);
//		_gel("report_pixel").src = "http://contests.labpixies.com/view.php?vid="+gmarkers_ids[_idx]+"&cont_id="+contestID+"&rand="+Math.round(Math.random()*100000);
//	}
//	
//	//Utils
//  function randOrd(){
//	return (Math.round(Math.random())-0.5); 
//  }
//	 
//  function getJson(b,errorReportFunction){
//        
//        clearTimeout(timerHandle);
//        timerHandle = setTimeout(errorReportFunction,30000);
//        var c=document.getElementsByTagName("head")[0];
//        var d=document.createElement("script");
//        d.type="text/javascript";
//        d.charset="utf-8";
//        d.defer="defer";
//        var e=b;
//        e=e+"&nocache="+_json_with_no_cache++;
//        d.src=e;
//        var f=function(){
//            var j=d.parentNode;
//            j.removeChild(d);
//            delete d
//        };
//        var g=function(j){
//            var s=(j?j:window.event).target?(j?j:window.event).target:(j?j:window.event).srcElement;
//            if(s.readyState=="loaded"||s.readyState=="complete"){
//                f();
//                return;
//            }
//        };
//        if(navigator.product=="Gecko"){
//            d.onload=f;
//        }else{
//            d.onreadystatechange=g;
//        }
//        c.appendChild(d)
//    }
//	
//	function _LP_EmbedFlash(_url, _id, _params){
//	  var isFF = ((navigator.userAgent.toLowerCase().indexOf("firefox") >= 0) || (navigator.userAgent.toLowerCase().indexOf("camino") >= 0));
//	  if(!isFF){
//		_IG_EmbedFlash(_url, _id,  _params);
//	  }else{
//		var params = _params;
//		_gel(_id).innerHTML = '<object width="'+params.width+'" height="'+params.height+'"><param name="movie" value="'+_url+'"></param><param name="wmode" value="'+params.wmode+'"></param><embed src="'+_url+'" type="application/x-shockwave-flash" wmode="'+params.wmode+'" width="'+params.width+'" height="'+params.height+'"></embed></object>';    
//	  }
//	}
//}

if( opt.state  &&  opt.state != 'us' ) {
	document.write(
		'<script type="text/javascript" src="', opt.dataUrl, 'shapes/coarse/us.js', '">',
		'<\/script>'
	);
}

})( jQuery );
