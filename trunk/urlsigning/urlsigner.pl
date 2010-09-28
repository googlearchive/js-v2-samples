#!/usr/bin/perl
#
# Copyright (c) 2010 iGLASS Networks (http://www.iglass.net). All rights reserved.
# This program is free software; you can redistribute it and/or
# modify it under the same terms as Perl itself.
# The program contained herein is provided to you "AS IS" without any
# warranties of any kind.
#

# Required Perl Libraries.
use Digest::HMAC_SHA1;
use MIME::Base64;
use URI::URL;

use 5.006;
use strict;
use warnings;

sub decode_urlsafe_base64 {
  my($content) = @_;

  # replace '+' by '-', and '/' by '_'
  $content =~ tr/-/\+/;
  $content =~ tr/_/\//;

  return decode_base64($content);
}

sub encode_urlsafe{
  my($content) = @_;
  $content =~ tr/\+/\-/;
  $content =~ tr/\//\_/;

  return $content;

}

sub sign_url {
  my($url) = @_;

  # Private Key - Replace with your private key.
  my $KEY_STRING = 'vNIXE0xscrmjlyV-12Nj_BvUPaw=';

  # Decode the private key into original binary format.
  my $key = decode_urlsafe_base64($KEY_STRING);

  # Take only the query part
  my $parsed_url = URI::URL->new($url);
  my $url_to_sign = $parsed_url->path_query;

  # Create HMAC-SHA1 Signature
  my $digest = Digest::HMAC_SHA1->new($key);
  $digest->add($url_to_sign);

  # Encode binary signature.
  my $signature = $digest->b64digest;

  # Make Signature URL safe
  $signature = encode_urlsafe($signature);

  return ( $parsed_url->scheme .'://' .  $parsed_url->host .
          $url_to_sign .'&signature=' . $signature )
}


#
# The following is an example from Google w/ result
# See http://code.google.com/apis/maps/documentation/premier/guide.html#SignatureExamples
#

# Propertly encoded URL - Replace with your URL to be signed.
my $url = "http://maps.google.com/maps/api/geocode/json?address=New+York&sensor=false&client=clientID";

my $signed_url = sign_url($url);

print $signed_url . "\n";
