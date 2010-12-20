require "rubygems"
require "bundler/setup"
Bundler.require(:default, ENV['RACK_ENV'])

require './blog.rb'

# Rack config
use Rack::Static, :urls => ['/css', '/js', '/images', '/favicon.ico'], :root => 'public'
use Rack::CommonLogger

if ENV['RACK_ENV'] == 'development'
  use Rack::ShowExceptions
else
  use Rack::Rewrite do
    r301 %r{.*}, 'http://harry.me$&', :if => Proc.new {|rack_env|
      rack_env['SERVER_NAME'] != 'harry.me'
    }
  end
end

#
# Create and configure a toto instance
#
toto = Toto::Server.new do
  #
  # Add your settings here
  # set [:setting], [value]
  # 
  set :author,      "Harry Brundage"                          # blog author
  set :title,       "Binharry"                                # site title
  if ENV['RACK_ENV'] == 'development'
    set :url, 'http://localhost:8080'
  else
    set :url, 'http://harry.me'                         # site root URL
  end
  set :prefix,      ''                                        # common path prefix for all pages
  set :root,        "index"                                   # page to load on /
  set :date,        lambda {|now| now.strftime("%d/%m/%Y") }  # date format for articles
  set :markdown,    :smart                                    # use markdown + smart-mode
  set :disqus,      "harrisonbrundage"                                     # disqus id, or false
  set :summary,     :max => 150, :delim => /~\n/              # length of article summary and delimiter
  set :ext,         'md'                                     # file extension for articles
  set :cache,       28800                                     # cache site for 8 hours
  set :date, lambda {|now| now.strftime("%B #{now.day.ordinal} %Y") }
  set :github, {:user => "hornairs", :repos => ["thwart", "jester", "ecse321"], :ext => ''} # Github username and list of repos

  #set :to_html   do |path, page, ctx|                         # returns an html, from a path & context
    #ERB.new(File.read("#{path}/#{page}.rhtml")).result(ctx)
  #end

  set :error     do |code|                                    # The HTML for your error page
    "<font style='font-size:300%'>toto, we're not in Kansas anymore (#{code})</font>"
  end

  set :to_html, lambda {|path, page, ctx, blk|
    #ctx = eval "self", ctx
    Dir.glob("#{path}/#{page}.*").each do |filename|
      return ::Tilt.new(filename).render(ctx, &blk)
    end
    return false
  }

end

run toto
