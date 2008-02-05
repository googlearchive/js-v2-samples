#!/usr/bin/env ruby

#puts 'starting'

require 'secret'

require 'hpricot'
require 'net/http'
require 'xmpp4r-simple'

im = Jabber::Simple.new( Secret::USERNAME, Secret::PASSWORD )
im.deliver( 'twitter@twitter.com', 'on' )

while true
	im.received_messages { |msg|
		if msg.type == :chat
			body = msg.body
			match = /\s*\((.*)\)/.match(msg.body)
			if match
				user = match[1]
				doc = Hpricot::XML(msg.to_s)
				author = (doc/:author/:name).text
				http = Net::HTTP.new( 'api.twittervision.com' )
				headers, tvbody = http.get( "/user/current_status/#{user}.xml" )
				if headers.code == '200'
					vis = Hpricot::XML(tvbody)
					puts tvbody
				end
			end
		end
	}
	sleep 10
end

puts 'done'

			#doc = Hpricot::XML(msg.to_s)
			#link = (doc/:entry/:source/:link).first
			#if link
			#	user = link.get_attribute(:href).gsub( 'http://twitter.com/', '' )
			#	author = (doc/:author/:name).text
			#	#if author != ''
			#		body = (doc/:body).text
			#		http = Net::HTTP.new( 'api.twittervision.com' )
			#		headers, body = http.get( "/user/current_status/#{user}.xml" )
			#		if headers.code == '200'
			#			vis = Hpricot::XML(body)
			#			puts body
			#		end
			#		puts "#{author}: '#{body}'"
			#	#end
			#end
