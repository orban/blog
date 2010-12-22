module Toto
  module Template
    def to_html page, config, &blk
      path = ([:layout, :repo].include?(page) ? Paths[:templates] : Paths[:pages])
      config[:to_html].call(path, page, self, blk)
    end
  end
end
