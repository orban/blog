source :gemcutter

gem 'toto', '0.4.9'
gem 'rack-rewrite'
gem 'compass', '0.10.6'
gem 'haml', '3.0.25'
gem 'tilt'
gem 'rack-codehighlighter', :require => 'rack/codehighlighter'

# Ultraviolet. God what a pain.
gem 'plist', :git => "git://github.com/spox/plist.git"
gem 'textpow', :git => "git://github.com/spox/textpow.git"
gem 'ultraviolet', :git => "git://github.com/hornairs/ultraviolet.git", :require => 'uv'

group :production do
  gem 'newrelic_rpm'
end

group :development, :test do 
  gem 'unicorn'
  gem 'ruby-debug19', :require => "ruby-debug"
  gem 'guard'
  gem 'guard-coffeescript'
  gem 'guard-compass'
  gem 'growl'
  gem "rack-nocache"
  gem "evergreen", :git => "git@github.com:hornairs/evergreen.git", :submodules => true
end
