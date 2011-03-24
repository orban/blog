use Rack::Nocache
map "/evergreen" do
  run Evergreen::Suite.new(File.dirname(__FILE__)).application
end
