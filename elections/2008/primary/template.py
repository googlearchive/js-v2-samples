#!/usr/bin/env python

import re

def T( text, vars ):
    return re.sub( '\n\s*', '', text ) % vars

#print T( '''
#    <a href="%(url)s">
#        %(link)s
#    </a>
#''', {
#    'link':'my link',
#    'url':'http://example.com/'
#})
