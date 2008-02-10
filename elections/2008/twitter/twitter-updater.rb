#!/usr/bin/env ruby

#puts 'starting'

require 'banned-words'
require 'secret'

require 'hpricot'
require 'json'
require 'net/http'
require 'xmpp4r-simple'

MAX_UPDATES = 50

lastwrite = Time.now

users = {}
updates = {}
updatelist = []

#def readupdates()
#	File.open( 'tweets/tweets.js', 'r' ) do |f|
#		data = f.read
#		oldUpdates = JSON.parse( data )
#		oldUpdates.each { |update|
#			updates[ update['message'] ] = update
#			updatelist.push( update )
#		}
#	end
#end

def writeupdates( updatelist )
	File.open( 'tweets/tweets.js', 'w' ) do |f|
		f.puts updatelist.to_json
	end
	p 'Checking in updates'
	`svn ci -m "Twitter update" tweets/tweets.js`
	p 'Done checking in'
end

#readupdates

im = Jabber::Simple.new( Secret::USERNAME, Secret::PASSWORD )
im.deliver( 'twitter@twitter.com', 'on' )

while true
	im.received_messages { |msg|
		if msg.type == :chat and msg.from == 'twitter@twitter.com' and not updates[msg.body]
			body = msg.body
			match = /^\s*\((.*)\):(.*)$/.match(body)
			if match
				username = match[1]
				message = match[2]
				if Banned.banned(body)
					p "Blocked: #{message}"
				else
					user = users[username]
					doc = Hpricot::XML(msg.to_s)
					author = (doc/:author/:name).text
					if not user
						http = Net::HTTP.new( 'api.twittervision.com' )
						headers, tvbody = http.get( "/user/current_status/#{username}.xml" )
						if headers.code == '200'
							tv = Hpricot::XML(tvbody)
							loc = (tv/:location)
							lat = (loc/:latitude).text
							lon = (loc/:longitude).text
							if lat != '' and lon != ''
								users[username] = {
									'user' => username,
									'author' => author,
									'name' => (tv/:name).text,
									'image' => (tv/'profile-image-url').text,
									'lat' => (loc/:latitude).text,
									'lon' => (loc/:longitude).text,
									'where' => (tv/'current-location').text,
									'status' => 0
								}
							end
						end
					end
					user = users[username]
					if user
						update = {
							'body' => msg.body,
							'message' => message,
							'time' => Time.xmlschema( (doc/:published).text ).to_i
						}.merge( user )
						if Banned.banned( update['where'] )
							p "Blocked location: #{update['where']}"
						else
							updates[msg.body] = update
							updatelist.push( update )
							updatelist.delete_at(0) if updatelist.length > MAX_UPDATES
							if Time.now - lastwrite > 300 # or updatelist.length > 1
								lastwrite = Time.now
								writeupdates updatelist
							end
						end
					end
				end
			end
		end
	}
	sleep 10
end
