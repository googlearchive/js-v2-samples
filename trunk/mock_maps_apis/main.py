# Copyright 2013 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Mock of Google Maps APIs.

This application is intended for load testing _your_ applications, by providing
you a way to query a _mock_ of some of the Google Maps APIs, which you need to
run on _your_ own AppEngine instance.

See the app = ... block at the end for supported APIs. Adding more APIs (e.g.
Elevation, Places, etc.) should be pretty straight forward. Each endpoint (e.g.
/maps/api/geocode/json) will return a randomly picked response from the data
directory, from there you can serve either dummy responses or copies from the
original API. You should always including the most typical errors responses
(OVER_QUERY_LIMIT and ZERO_RESULTS at least) to test how your application
reacts to them.
"""

import os
import random
import webapp2


DATA_ROOT_PATH = 'data'


def ListdirFullpath(directory):
  """Like os.listdir but returns full paths.

  Source: http://stackoverflow.com/questions/120656/directory-listing-in-python

  Args:
    directory: A string with a directory name.

  Returns:
    A list of strings with the full path of every file in that directory.
  """
  return [os.path.join(directory, filename)
          for filename in os.listdir(directory)]


class GenericMapsApiResponse(webapp2.RequestHandler):
  """Base class that returns generic Maps API responses.

  You need to override the following methods to actually return some
  sensible content: GetContent() GetContentType().
  """

  def get(self):  # pylint: disable=g-bad-name
    self.response.headers['content-type'] = self.GetContentType()

    # Common headers from the Google Maps APIs as of June 2013.
    self.response.headers['access-control-allow-origin'] = '*'
    self.response.headers['cache-control'] = 'public, max-age=86400'
    self.response.headers['vary'] = 'Accept-Language'
    self.response.headers['x-xss-protection'] = '1; mode=block'

    self.response.write(self.GetContent())

  def GetContent(self):
    return ''

  def GetContentType(self):
    return 'text/plain'


class RandomHttpResponse(GenericMapsApiResponse):
  """Returns random plain-text responses.

  Implements GetContent() to populate the content of a file picked at
  random from whichever directory GetDataPath() returns. You need to
  override GetDataPath() and GetContentType().
  """

  def GetContentPath(self):
    return os.path.join(DATA_ROOT_PATH,
                        self.GetContentTypePath(),
                        self.GetApiShortName())

  def GetErrorsPath(self):
    return os.path.join(DATA_ROOT_PATH,
                        self.GetContentTypePath(),
                        'errors')

  def GetContent(self):
    files = (ListdirFullpath(self.GetContentPath()) +
             ListdirFullpath(self.GetErrorsPath()))
    fd = open(random.choice(files), 'r')
    return fd.read()


class JsonApiResponse(RandomHttpResponse):
  """Templated JSON response."""

  def GetContentTypePath(self):
    return 'json'

  def GetContentType(self):
    return 'application/json; charset=UTF-8'


class XmlApiResponse(RandomHttpResponse):
  """Templated XML response."""

  def GetContentTypePath(self):
    return 'xml'

  def GetContentType(self):
    return 'application/xml; charset=UTF-8'


class GeocodingApiResponse(object):
  """Helper class to return static values through inheritance."""

  def GetApiShortName(self):
    return 'geocoding'


class GeocodingApiJsonResponse(JsonApiResponse, GeocodingApiResponse):
  """Mock JSON response from the Google Maps Geocoding API V3."""
  pass


class GeocodingApiXmlResponse(XmlApiResponse, GeocodingApiResponse):
  """Mock XML response from the Google Maps Geocoding API V3."""
  pass


class DirectionsApiResponse(object):
  """Helper class to return static values through inheritance."""

  def GetApiShortName(self):
    return 'directions'


class DirectionsApiJsonResponse(JsonApiResponse, DirectionsApiResponse):
  """Mock JSON response from the Google Maps Directions API V3."""
  pass


class DirectionsApiXmlResponse(XmlApiResponse, DirectionsApiResponse):
  """Mock XML response from the Google Maps Directions API V3."""
  pass


class MainPage(webapp2.RequestHandler):
  def get(self):  # pylint: disable=g-bad-name
    self.response.headers['Content-Type'] = 'text/plain'
    self.response.write('Hello, webapp2 World!')


app = webapp2.WSGIApplication([
    ('/maps/api/geocode/json', GeocodingApiJsonResponse),
    ('/maps/api/geocode/xml', GeocodingApiXmlResponse),
    ('/maps/api/directions/json', DirectionsApiJsonResponse),
    ('/maps/api/directions/xml', DirectionsApiXmlResponse),
], debug=True)
