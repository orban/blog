module Toto
  module Template
    def to_html page, config, &blk
      path = ([:layout, :repo].include?(page) ? Paths[:templates] : Paths[:pages])
      config[:to_html].call(path, page, self, blk)
    end
  end

  class Repo

    FILE = "https://github.com/%s/%s/raw/master/%s"

    def readme
      filename = (FILE % [@config[:github][:user], self[:name], @config[:github][:files][self[:name]]])
      Tilt.new(filename) {open(filename).read }.render(self)
    rescue Timeout::Error, OpenURI::HTTPError => e
      homepage = "https://github.com/%s/%s" % [@config[:github][:user], self[:name]]
      "Couldn't fetch the readme, you can try going to <a href=\"#{homepage}\">the project homepage</a>."
    end

    alias :content readme    
  end
end
