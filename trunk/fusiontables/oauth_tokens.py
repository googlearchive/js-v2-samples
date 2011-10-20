#!/usr/bin/python
#
# Copyright (C) 2011 Google Inc.

""" Fusion Tables OAuth Helper

Retrieve OAuth 2.0 access and refresh tokens for Fusion Tables.
"""

import urllib2, urllib, json

def retrieve_tokens(client_id, client_secret, redirect_uri):

  print
  print 'Visit the URL below in a browser to authorize'
  print
  print '%s?client_id=%s&redirect_uri=%s&scope=%s&response_type=code' % \
    ('https://accounts.google.com/o/oauth2/auth', 
    client_id,
    redirect_uri,
    'https://www.googleapis.com/auth/fusiontables')
  print
  
  auth_code = raw_input('Enter authorization code ("code" parameter of URL): ')
  
  data = urllib.urlencode({
    'code': auth_code, 
    'client_id': client_id,
    'client_secret': client_secret,
    'redirect_uri': redirect_uri,
    'grant_type': 'authorization_code'
  })
  request = urllib2.Request(
    url='https://accounts.google.com/o/oauth2/token',
    data=data)
  request_open = urllib2.urlopen(request)
  
  response = request_open.read()
  tokens = json.loads(response)
  access_token = tokens['access_token']
  refresh_token = tokens['refresh_token']
  return access_token, refresh_token


if __name__ == "__main__":
  import sys

  if len(sys.argv) == 4:
    client_id = sys.argv[1]
    client_secret = sys.argv[2]
    redirect_uri = sys.argv[3]
  else:
    client_id = raw_input("Enter Client ID: ")
    client_secret = raw_input("Enter Client Secret: ")
    redirect_uri = raw_input("Enter Redirect URI: ")

  access_token, refresh_token = retrieve_tokens(client_id,
                                                client_secret,
                                                redirect_uri)
  print
  print "Access Token: %s" % (access_token)
  print "Refresh Token: %s" % (refresh_token)
  print

