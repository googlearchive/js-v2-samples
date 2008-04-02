(function() {
	var opt = GoogleElectionMapOptions = {
		primary: true,
		mapplet: true,
		state: '',
		//party: 'democrat',
		//party: 'republican',
		twitter: true,
		baseUrl: 'http://gmaps-samples.googlecode.com/svn/trunk/',
		_: null
	};
	var time = (new Date).getTime();
	var base = opt.baseUrl + 'elections/2008/primary/';
	document.write( [
		'<script type="text/javascript" src="', base, 'states/', opt.state || 'super', '/data.js?t=', time, '">',
		'<\/script>',
		'<script type="text/javascript" src="', base, 'supermap-twitter.js?t=', time, '">',
		'<\/script>'
	].join('') );
})();
