#!/usr/bin/env ruby

#puts 'starting'

require 'secret'

require 'hpricot'
require 'json'
require 'net/http'
require 'xmpp4r-simple'

MAX_UPDATES = 100

lastwrite = Time.now

users = {}
updates = {}
updatelist = []

def writeupdates( updatelist )
	File.open( 'tweets.js', 'w' ) do |f|
		f.puts updatelist.to_json
	end
end

im = Jabber::Simple.new( Secret::USERNAME, Secret::PASSWORD )
im.deliver( 'twitter@twitter.com', 'on' )

while true
	im.received_messages { |msg|
		if msg.type == :chat and msg.from == 'twitter@twitter.com' and not updates[msg.id]
			body = msg.body
			match = /^\s*\((.*)\):(.*)$/.match(body)
			if match
				username = match[1]
				message = match[2]
				user = users[username]
				doc = Hpricot::XML(msg.to_s)
				author = (doc/:author/:name).text
				if not user
					http = Net::HTTP.new( 'api.twittervision.com' )
					headers, tvbody = http.get( "/user/current_status/#{username}.xml" )
					if headers.code == '200'
						tv = Hpricot::XML(tvbody)
						loc = (tv/:location)
						users[username] = {
							'user' => username,
							'name' => (tv/:name).text,
							'image' => (tv/'profile-image-url').text,
							'lat' => (loc/:latitude).text,
							'lon' => (loc/:longitude).text,
							'status' => 0
						}
					end
				end
				user = users[username]
				if user
					update = {
						'message' => message,
						'time' => Time.xmlschema( (doc/:published).text ).to_i
					}.merge( user )
					updates[msg.id] = update
					updatelist.push( update )
					updatelist.delete_at(0) if updatelist.length > MAX_UPDATES
					if Time.now - lastwrite > 300 or updatelist.length > 0
						lastwrite = Time.now
						writeupdates updatelist
					end
				end
			end
		end
	}
	sleep 10
end
