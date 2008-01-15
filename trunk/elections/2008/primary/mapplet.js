(function() {
	var opt = GoogleElectionMapOptions = {
		primary: true,
		state: 'mi',
		//party: 'democrat',
		//party: 'republican',
		baseUrl: 'http://gmaps-samples.googlecode.com/svn/trunk/',
		_: null
	};
	var time = (new Date).getTime();
	var base = opt.baseUrl + 'elections/2008/primary/';
	document.write( [
		'<script type="text/javascript" src="', base, 'states/', opt.state, '/data.js?t=', time, '">',
		'<\/script>',
		'<script type="text/javascript" src="', base, 'map.js?t=', time, '">',
		'<\/script>'
	].join('') );
})();
