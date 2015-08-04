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
	
	hoverize = function( fn ) {
		
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
				fire();
			},
			
			hover: function() {
				args = arguments;
				start();
			}
		};
	}
})( jQuery );

(function( $ ) {

var opt = window.GoogleElectionMapOptions || {};

//var imgBaseUrl = 'http://mg.to/iowa/server/images/';
var imgBaseUrl = 'http://googlemaps.github.io/js-v2-samples/elections/2008/images/icons/';

function loadScript( url ) {
	var script = document.createElement( 'script' );
	script.type = 'text/javascript';
	script.charset = 'utf-8';
	var seq = (new Date).getTime();
	script.src = url + '?q=' + seq;
	script.title = 'jsonresult';
	$('head')[0].appendChild( script );
}

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
		var by = this.by[field] = {};
		for( var i = 0, n = this.length;  i < n;  ++i ) {
			var obj = this[i];
			by[obj[field]] = obj;
			obj.index = i;
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

var parties = [
	{ name: 'democrat', shortName: 'Democratic', fullName: 'Democratic Party', url:'http://www.iowademocrats.org/' },
	{ name: 'republican', shortName: 'Republican', fullName: 'Republican Party', url:'http://www.iowagop.net/' }
].index('name');

var candidates = {
	all: [],
	democrat: [
		{ name: 'biden', lastName: 'Biden', fullName: 'Joe Biden', color: '#20FF1F' },
		{ name: 'clinton', lastName: 'Clinton', fullName: 'Hillary Clinton', color: '#FFFA00' },
		{ name: 'dodd', lastName: 'Dodd', fullName: 'Chris Dodd', color: '#E4Af95' },
		{ name: 'edwards', lastName: 'Edwards', fullName: 'John Edwards', color: '#FF1300' },
		{ name: 'gravel', lastName: 'Gravel', fullName: 'Mike Gravel', color: '#8A5C2E' },
		{ name: 'kucinich', lastName: 'Kucinich', fullName: 'Dennis Kucinich', color: '#EE00B5' },
		{ name: 'obama', lastName: 'Obama', fullName: 'Barack Obama', color: '#1700E8' },
		{ name: 'richardson', lastName: 'Richardson', fullName: 'Bill Richardson', color: '#336633' }
	],
	republican: [
		{ name: 'giuliani', lastName: 'Giuliani', fullName: 'Rudy Giuliani', color: '#336633' },
		{ name: 'huckabee', lastName: 'Huckabee', fullName: 'Mike Huckabee', color: '#1700E8' },
		{ name: 'hunter', lastName: 'Hunter', fullName: 'Duncan Hunter', color: '#8A5C2E' },
		{ name: 'keyes', lastName: 'Keyes', fullName: 'Alan Keyes', color: '#8080FF' },
		{ name: 'mccain', lastName: 'McCain', fullName: 'John McCain', color: '#FFFA00' },
		{ name: 'paul', lastName: 'Paul', fullName: 'Ron Paul', color: '#E4Af95' },
		{ name: 'romney', lastName: 'Romney', fullName: 'Mitt Romney', color: '#FF1300' },
		{ name: 'tancredo', lastName: 'Tancredo', fullName: 'Tom Tancredo', color: '#EE00B5' },
		{ name: 'thompson', lastName: 'Thompson', fullName: 'Fred Thompson', color: '#20FF1F' }
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
	
	var mapplet = ! window.GBrowserIsCompatible;
	
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

//var mapplet = location.host == 'gmodules.com';
var mapplet = ! window.GBrowserIsCompatible;

var partyButtons = opt.party ? '' : [
	'<div style="margin-top:8px;">',
		'<b>Vote results:</b>',
		'<button style="margin-left:8px;" id="btnDem">Democratic</button>',
		'<button style="margin-left:8px;" id="btnRep">Republican</button>',
		'</div>'
].join('');

	document.write( (
		opt.projector ? [
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
		] : mapplet ? [
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
				'<div style="font-weight:bold;">',
					'<span style="color:red;">New!</span> ',
					'<a href="http://maps.google.com/maps/mpl?moduleurl=http://www.google.com/mapfiles/mapplets/elections/2008/primary/primaries.xml" target="_top">Flordia Primary live results</a>',
				'</div>',
				'<div>',
					'Click the map for town info and results',
				'</div>',
				'<div style="padding-bottom:6px;">',
					'View in <a href="http://earth.google.com/" target="_blank">Google Earth</a>: ',
					'<a href="http://googlemaps.github.io/js-v2-samples/elections/2008/primary/nh/earth-nh-democrat.kml">Democratic</a>',
					' ',
					'<a href="http://googlemaps.github.io/js-v2-samples/elections/2008/primary/nh/earth-nh-republican.kml">Republican</a>',
				'</div>',
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
				'<div id="votesbar">',
					'<h1 id="votestitle"></h1>',
					'<div id="legend">',
						'Loading&#8230;',
					'</div>',
				'</div>',
				'<div id="videos" style="margin-top:8px;">',
				'</div>',
				'<div id="news" style="margin-top:6px;">',
				'</div>',
			'</div>'
		] : [
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
				'#fullstate { margin-top:12px; }',
				'#fullstate table { width:700px; }',
				'#fullstate th, #fullstate td { text-align: right; background-color:#E8E8E8; padding:2px; }',
				'#fullstate th.countyname, #fullstate td.countyname { text-align:left; font-weight:bold; }',
				'.statewide * { font-weight: bold; }',
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
						'<div id="map" style="width: 450px; height: 710px">',
						'</div>',
					'</td>',
					'<td valign="top">',
						partyButtons,
						'<div id="votesbar">',
							'<h1 id="votestitle">Primary Results</h1>',
							'<div style="font-weight:bold;">Statewide Results</div>',
							'<div id="legend">',
								'Loading&#8230;',
							'</div>',
							'<div id="results">',
								'Roll the mouse over the map for town-by-town results<br /><br />',
								//'Scroll down for statewide details',
							'</div>',
						'</div>',
					'</td>',
				'</tr>',
			'</table>',
			'<div id="fullstate">',
			'</div>'
		] ).join('') );

if( 0 ) {
	var gFeedURLs = {
		news:'http://mg.to/iowa/section.xml',
		events:'http://mg.to/iowa/caucus_events.xml'
	};
}
else {
	var gFeedURLs = {
		news: 'http://news.google.com/?ned=us&topic=el&output=rss',
		events:'http://data.desmoinesregister.com/newsroom_google/xml/caucus_events.xml',
		video: 'http://www.youtube.com/rss/user/wmurtv/videos.rss'
	};
}

var map;

var counties = Data.counties || [], state = Data.state || {};
counties.index( 'name' );

//var allEventData = [];
var eventMarkers = [];
var icons = {};

function onEventsReady( xml ) {
	var items = {
		eventtitle:1, eventid:1, eventdate:1, eventtimestart:1, eventendtime:1,
		venueid:1, venuename:1, venueaddress:1, venuecity:1, venuelat:1, venuelng:1,
		party:1, feclist:1, etidlist:1, candnamelist:1, iscurrent:1, eventdetailslink:1
	};
	
	$('marker',xml).each( function() {
		var event = {};
		for( var item in items ) event[item] = this.getAttribute(item);
		event.latlng = new GLatLng( +event.venuelat, +event.venuelng );
		event.marker = addEventMarker( event );
		//allEventData.push( event );
	});
	
	initMap();
}

function addEventMarker( event ) {
	var color = { b:'white', d:'blue', r:'red' }[event.party] || 'white';
	var icon = icons[color];
	var marker = new GMarker( event.latlng, { icon:icons[color] } );
	GEvent.addListener( marker, 'click', function() {
		marker.openInfoWindowHtml( formatEvent(event), { maxWidth:500 } );
	});
	eventMarkers.push( marker );
	map.addOverlay( marker );
	return marker;
}

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
	
	if( mapplet )
		_IG_AdjustIFrameHeight();
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
	
	if( mapplet )
		_IG_AdjustIFrameHeight();
}

function initMap() {
	if( ! mapplet ) {
		GEvent.addListener( map, 'mousemove', mousemoved/*.hover*/ );
		//GEvent.addListener( map, 'mouseout', mousemoved.clear );
	}
	
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

function zoomRegion( region ) {
	map.closeInfoWindow();
	if( ! region ) {
		// Iowa:
		//map.setCenter( new GLatLng( 41.94, -93.69 ), 7 );
		// NH:
		map.setCenter( new GLatLng( 43.975, -71.628 ), 8 );
		//selectRegion();
	}
	else {
		//GAsync( region.polygon.base, 'getBounds',
		//	function( bounds ) {
		//		GAsync( map, 'getBoundsZoomLevel', [ bounds ],
		//			function( zoom ) {
		//				//selectRegion( region );
		//				var center = pointLatLng( region.centroid );
		//				map.setCenter( center, zoom );
		//			});
		//	});
	}
}

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
	function hh() {
		var xx = Math.floor( Math.random() *128 + 96 ).toString(16);
		return xx.length == 2 ? xx : '0'+xx;
	}
}

function showVotes( json, party ) {
	map.clearOverlays();
	$('script[title=jsonresult]').remove();
	if( json.status == 'later' ) return;
	showState( json, party );
	showCounties( json, party );
	if( mapplet )
		_IG_AdjustIFrameHeight();
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

function showStateSidebar( json, party ) {
	var state = json.state, tallies = state[party], precincts = state.precincts;
	tallies.index('name');
	var rows = [];
	var cands = candidates[party];
	addRows();
	
	var html = [
		'<table>',
			rows.join(''),
		'</table>',
		'<div class="legendreporting">',
			precincts.reporting, ' of ', precincts.total, ' precincts reporting',
		'</div>'
	].join('');
	
	$('#legend').html( html );
	
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
							Math.round( tally.votes / state.total * 100 ), '%',
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

function showCounties( json, party ) {
	counties.forEach( function( county ) {
		var vertices = county.vertices;
		
		if( json ) {
			var data = json.counties[county.name];
			var tallies = county.tallies = data[party];
			county.precincts = data.precincts;
			county.total = data.total;
			
			var leader = tallies && tallies[0];
			if( leader ) {
				var votes = leader.votes;
				var candidate = candidates[party].by.name[leader.name];
				var icon = candidate.icon;
				
				//if( ! opt.projector  &&  ! mapplet ) {
				//	var marker = new GMarker( new GLatLng( county.centroid[0], county.centroid[1] ), { icon:icon } );
				//	map.addOverlay( marker );
				//}
				
				var color = candidate.color;
			}
		}
		
		var pts = county.vertices;
		var border = '#000080';
		if( json ) {
			county.polygon = {
				base:
					opt.projector ? new GPolygon( pts, border, 1, .5, color, .9 )  :
					votes ? new GPolygon( pts, border, 1, .5, color, .7 ) :
					new GPolygon( pts, border, 1, .5 ) //,
				//select: new GPolygon( pts, color2, 1, .75, color2, .15 )
			};
		}
		else {
			var color = randomColor();
			county.polygon = {
				base: new GPolygon( pts, border, 1, .5, color, .7 )
			};
		}
		map.addOverlay( county.polygon.base );
		GEvent.addListener( county.polygon.base, 'click', function() {
			map.openInfoWindowHtml(
				pointLatLng( county.centroid ),
				voteBalloon( json, county ),
				{ maxWidth:300 } );
		});
	});
	
	initMap();
}

function voteBalloon( json, county ) {
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

Json = {
	democratResults: function( json ) { showVotes( json, 'democrat' ); },
	republicanResults: function( json ) { showVotes( json, 'republican' ); }
};

function load() {
	if( mapplet ) {
		map = new GMap2;
		zoomRegion();
	}
	else {
		if( ! GBrowserIsCompatible() ) return;
		map = new GMap2( $('#map')[0] );
		zoomRegion();
		map.enableContinuousZoom();
		map.enableDoubleClickZoom();
		map.enableGoogleBar();
		map.enableScrollWheelZoom();
		map.addControl( new GLargeMapControl() );
	}
	
	makeIcons();
	
	counties.forEach( function( county ) {
		var points = county.points;
		var pts = county.vertices = [];
		for( var i = 0, n = points.length;  i < n;  ++i ) {
			var point = points[i];
			pts.push( new GLatLng( point[0], point[1] ) );
		}
	});
	
	//if( mapplet ) showVotes();
	
	//GEvent.addListener( map, 'click', function( overlay, latlng ) {
	//	//marker.openInfoWindowHtml( formatEvent(event), { maxWidth:500 } );
	//});
	
	var testdata = false;
	if( location.search.slice(1) == 'test' )
		testdata = true;
		
	var q = opt.party || location.search.slice(1);
	var party = parties.by.name[q];
	if( party ) {
		loadResults( party );
	}
	else {
		//download( gFeedURLs.events, onEventsReady );
		loadResults( parties[ Math.random() < .5 ? 0 : 1 ] );
	}
	//showCounties();
	
	if( mapplet ) {
		download( gFeedURLs.video, onVideoReady );
		download( gFeedURLs.news, onNewsReady );
	}
	
	$('#btnDem').click( function() {
		loadResults( parties.by.name['democrat'] );
		return false;
	});

	$('#btnRep').click( function() {
		loadResults( parties.by.name['republican'] );
		return false;
	});
	
	function loadResults( party ) {
		map.clearOverlays();
		$('#votestitle').html( [
			party.fullName
		].join('') );
		$('#legend').html( 'Loading&#8230;' );
		//loadScript( 'http://gigapad/elections/2008/primary/nh/results_' + party.name + '.js' );
		loadScript( 'http://googlemaps.github.io/js-v2-samples/elections/2008/primary/nh/results_' + party.name + '.js' );
		
		//loadScript( 'http://mg.to/iowa/server/' + q + '_results.js' );
		//if( testdata )
		//	loadScript( 'http://gigapad/iowa/server/test.' + party + '_results.js' );
		//else
			//loadScript( 'http://googlemaps.github.io/js-v2-samples/elections/iowa/caucus/live/' + party.name + '_results.js' );
		//var kmlBaseUrl = 'http://mg.to/nh/';
		//var kmlBaseUrl = 'http://googlemaps.github.io/js-v2-samples/elections/2008/primary/nh/';
		//var kml = new GGeoXml( kmlBaseUrl + 'maps-nh-' + party.name + '.kml?t=' + new Date().getTime() );
		//map.addOverlay( kml );
		//GEvent.addListener( kml, 'click', function( overlay, latlng ) {
		//	console.log( 'kml', overlay, latlng );
		//	//marker.openInfoWindowHtml( formatEvent(event), { maxWidth:500 } );
		//});
	}
	
	
	//initControls();
	if( mapplet )
		_IG_AdjustIFrameHeight();
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
	
	for( var i = 0, n = counties.length;  i < n;  ++i ) {
		var county = counties[i];
		if( county.polygon.base.contains( latlng ) ) {
			//$('#test').css({ color: region.color });
			break;
		}
	}

	if( i == n ) i = -1;
	county = counties[i];
	
	if( county )
		$('#results').html( countyTable( county ) );
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
							Math.round( tally.votes / county.total * 100 ), '%',
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
		lines.push( '<tr><td>' + county.name + ' residents vote in a nearby town.</td></tr>' );
	}
	else {
		lines.push( '<tr><td>No votes reported</td></tr>' );
	}
	
	var wikilink = ! balloon ? '' : [
		'<a href="http://en.wikipedia.org/wiki/',
				( county.name + ', New Hampshire' ).replace( / /g, '_' ),
				'" target="_blank">',
			'Town information',
		'</a>'
	].join('');
	
	return [
		'<div style="', fontsize, 'font-weight:bold;">', county.name, ', NH</div>',
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
	
	if( mapplet )
		_IG_AdjustIFrameHeight();
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

})( jQuery );
