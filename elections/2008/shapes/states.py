#!/usr/bin/env python

states = [
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
]

statesByAbbr = {}
for state in states:
	statesByAbbr[ state['abbr'] ] = state

statesByName = {}
for state in states:
	statesByName[ state['name'] ] = state
