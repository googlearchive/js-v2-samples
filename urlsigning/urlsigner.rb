#!/usr/bin/ruby
# Test Script for Google Maps API signatures

require 'rubygems'
require 'base64'
require 'uri'
# hmac, and hmac-sha1, are from # gem install ruby-hmac
require 'hmac'
require 'hmac-sha1'

def urlSafeBase64Decode(base64String)
  return Base64.decode64(base64String.tr('-_','+/'))
end

def urlSafeBase64Encode(raw)
  return Base64.encode64(raw).tr('+/','-_')
end


def signURL(key, url)
  parsedURL = URI.parse(url)
  urlToSign = parsedURL.path + '?' + parsedURL.query

  # Decode the private key
  rawKey = urlSafeBase64Decode(key)

  # create a signature using the private key and the URL
  sha1 = HMAC::SHA1.new(rawKey)
  sha1 << urlToSign
  rawSignature = sha1.digest()

  # encode the signature into base64 for url use form.
  signature =  urlSafeBase64Encode(rawSignature)

  # prepend the server and append the signature.
  signedUrl = parsedURL.scheme+"://"+ parsedURL.host + urlToSign + "&signature=#{signature}"
  return signedUrl
end

# URL to sign
url = "http://maps.google.com/maps/api/geocode/json?address=New+York&sensor=false&client=clientID"
# Private Key
PRIVATE_KEY = "vNIXE0xscrmjlyV-12Nj_BvUPaw="

print signURL(PRIVATE_KEY, url)
