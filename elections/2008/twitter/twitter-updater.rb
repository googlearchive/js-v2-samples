#!/usr/bin/env ruby

#puts 'starting'

require 'rubygems'

require 'banned-words'
require 'secret'

require 'hpricot'
require 'json'
require 'net/http'
require 'time'
require 'xmpp4r-simple'

class Updater
	
	def initialize
		@MAX_UPDATES = 50
		@lastwrite = Time.now
		@users = {}
		@updates = {}
		@updatelist = []
		@im = Jabber::Simple.new( Secret::USERNAME, Secret::PASSWORD )
		@im.deliver( 'twitter@twitter.com', 'on' )
	end
	
	def run
		while true
			begin
				receive
				sleep 10
			rescue
				p "Exception raised!"
			end
		end
	end
	
	#def readupdates
	#	File.open( 'tweets/tweets.js', 'r' ) do |f|
	#		data = f.read
	#		oldUpdates = JSON.parse( data )
	#		oldUpdates.each { |update|
	#			@updates[ update['message'] ] = update
	#			@updatelist.push( update )
	#		}
	#	end
	#end
	
	def writeupdates
		File.open( 'tweets/tweets.js', 'w' ) do |f|
			f.puts @updatelist.to_json
		end
		p 'Checking in updates'
		`svn ci -m "Twitter update" tweets/tweets.js`
		p 'Done checking in'
	end
	
	#readupdates
	
	def onemsg( msg )
		return if msg.type != :chat or msg.from != 'twitter@twitter.com' or @updates[msg.body]
		body = msg.body
		match = /^\s*\((.*)\):(.*)$/.match(body)
		return if not match
		username = match[1]
		message = match[2]
		if Banned.banned(body)
			p "Blocked: #{message}"
			return
		end
		doc = Hpricot::XML(msg.to_s)
		author = (doc/:author/:name).text
		user = getuser( username, author )
		return if not user
		update = {
			'body' => msg.body,
			'message' => message,
			'time' => Time.xmlschema( (doc/:published).text ).to_i
		}.merge( user )
		if Banned.banned( update['where'] )
			p "Blocked location: #{update['where']}"
			return
		end
		p "Posting: #{message}"
		@updates[msg.body] = update
		@updatelist.push( update )
		@updatelist.delete_at(0) if @updatelist.length > @MAX_UPDATES
		if Time.now - @lastwrite > 300 and @updatelist.length >= 20
			@lastwrite = Time.now
			writeupdates
		end
	end
	
	def getuser( username, author )
		if not @users[username]
			http = Net::HTTP.new( 'api.twittervision.com' )
			headers, body = http.get( "/user/current_status/#{username}.xml" )
			if headers.code == '200'
				tv = Hpricot::XML(body)
				loc = (tv/:location)
				lat = (loc/:latitude).text
				lon = (loc/:longitude).text
				if lat != '' and lon != ''
					@users[username] = {
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
		@users[username]
	end
	
	def receive
		@im.received_messages do |msg|
			onemsg msg
		end
	end
	
end

updater = Updater.new
updater.run
