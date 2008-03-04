(function() {
	GoogleElectionMapOptions = {
		mapplet: true,
		primary: true,
		state: '',
		_: null
	};

	document.write(
		'<script type="text/javascript" src="',
			_IG_GetCachedUrl( 'http://primary-maps-2008.googlecode.com/svn/trunk/map.js', { refreshInterval:120 } ),
		'">',
		'<\/script>'
	);
})();
