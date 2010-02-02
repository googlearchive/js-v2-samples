#!/usr/bin/python
# coding: utf8

import sys
import hashlib
import urllib
import hmac
import base64
import urlparse

print("")
print("URL Signer 1.0")
print("")

# Collect the URL input string (which must alrady be URL-encoded)
# from the user and parse it into its collective components
# For testing purposes, if no URL is entered, we use a default
inputStr = raw_input('URL to Sign (Must be URL-Encoded) --> ')
if not inputStr:
  inputStr = "YOUR_URL_TO_SIGN"

print("URL To Sign: " + inputStr)
url = urlparse.urlparse(inputStr)

# Collect the private key. You may want to store this
# in a private file.
privateKey = raw_input('Private Key ---> ')
if not privateKey:
  privateKey = "YOUR_PRIVATE_KEY"
  
print("Private Key: " + privateKey)

#We only need to sign the path+query part of the string
urlToSign = url.path + "?" + url.query
print("")
print("Original Path + Query: " + urlToSign)

# Decode the private key into its binary format
# We need toe decode the URL-encoded private key
decodedKey = base64.urlsafe_b64decode(privateKey)

# Create a signature using the private key and the URL-encoded
# string using HMAC SHA1. This signature will be binary.
signature = hmac.new(decodedKey, urlToSign, hashlib.sha1)

# Encode the binary signature into base64 for use within a URL
encodedSignature = base64.urlsafe_b64encode(signature.digest())
print("")
print("B64 Signature: " + encodedSignature)
originalUrl = url.scheme + "://" + url.netloc + url.path + "?" + url.query
print("")
print("Full URL: " + originalUrl + "&signature=" + encodedSignature)
