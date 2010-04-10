
require 'toto'
require 'blog.rb'
require 'twitter'

# Rack config
use Rack::Static, :urls => ['/css', '/js', '/images', '/favicon.ico'], :root => 'public'
use Rack::CommonLogger

if ENV['RACK_ENV'] == 'development'
  use Rack::ShowExceptions
end

#
# Create and configure a toto instance
#
toto = Toto::Server.new do
  #
  # Add your settings here
  # set [:setting], [value]
  # 
  set :author,    "Harrison Brundage"	                		# blog author
  set :title,     "harblog"             		   				# site title
  # set :root,      "index"                                   # page to load on /
  # set :date,      lambda {|now| now.strftime("%d/%m/%Y") }  # date format for articles
  set :markdown,  :smart                                      # use markdown + smart-mode
  set :disqus,    "harrisonbrundage"                            # disqus id, or false
  # set :summary,   :max => 150, :delim => /~/                # length of article summary and delimiter
  set :ext,       'md'                                     # file extension for articles
  # set :cache,      28800                                    # cache duration, in seconds
  set :github, {:user => "hornairs", :repos => ["scurvy", "kcpms", "rbacanable", "jester", "ecse321"], :ext => ''} # Github username and list of repos

  set :date, lambda {|now| now.strftime("%B #{now.day.ordinal} %Y") }
end

run toto


