/**
 * Locale support functions
 * Google Maps Torch Relay
 * Written: 2008/02/14
 * @author  Jeff Hall, Digital Maelstrom LLC
 */
 function getLQuery()
 {
	var query = (document.location) ? document.location.search : window.location.search;
	var index = query.indexOf('l=');
	
	if(index != -1)
	{
		return query.substr(index,7);
	}
	else
	{
		return "l=en_us";
	}

 }

 function determineLanguage()
 {
	var lang = "en";
	lang = getLQuery().substr(2,2);
	return lang;
 }

 function determineLocale()
 {
	var locale = "en_us";
	locale = getLQuery().substr(2,5);
	return locale;
 }
 
 function determineDate()
 {
 	var query = document.location.search;
 	var index = query.indexOf('d=');
 	
 	if(index != -1)
 	{
 		var param = query.substr(index, 12);
 		return param.substr(2,10).replace(/-/g, "/");
 	}
 	else
 	{
 		return null;
 	}
 }
 
