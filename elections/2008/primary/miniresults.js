var contentBase = window.contentBase || 'http://primary-maps-2008-data.googlecode.com/svn/trunk/miniresults/';
//var contentBase = 'http://mg.to/elections/';

var prefs = new _IG_Prefs();
var useTestData = prefs.getBool('testdata');
var homepage = prefs.getBool('homepage');
var which = homepage ? 'short' : 'long';
var party = ( Math.random() < .5 ? 'dem' : 'gop' );

setTimeout( function() { refresh(); }, 1 );

function refresh( p ) {
	party = p || party;
	var url = contentBase + 'miniresults-' + which + '-' + party + '.html';
	_IG_FetchContent( url, function( html ) {
		document.getElementById('container').innerHTML = html;
	},
	{
		refreshInterval: 150
	});
}

document.write(
	'<div id="container">',
		'Loading&#8230',
	'</div>'
);
