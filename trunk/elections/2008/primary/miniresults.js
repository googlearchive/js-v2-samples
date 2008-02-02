var contentBase = 'http://gmaps-samples.googlecode.com/svn/trunk/elections/2008/primary/states/super/';

var prefs = new _IG_Prefs();
var useTestData = prefs.getBool('testdata');
var homepage = prefs.getBool('homepage');
var which = homepage ? 'short' : 'long';

var party = ( Math.random() < .5 ? 'dem' : 'gop' );

setTimeout( function() {
	_IG_FetchContent( 
		contentBase + 'miniresults-' + which + '-' + party + '.html',
		function( html ) {
			document.getElementById('container').innerHTML = html;
		},
		{
			refreshInterval:0
		}
	);
}, 1 );

document.write(
	'<div id="container">',
		'Loading&#8230',
	'</div>'
);
