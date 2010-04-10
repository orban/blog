module Toto
  class Article
    def html_stub
      "<article class=\"post\">
          <header>
            <h1><a href=\" #{self.path}\">#{article.title}</a></h1>
            <span class=\"date\">#{article.date}</span>
          </header>

          <section class=\"content\">
            #{article[:tagline]}
          </section>
          <div class=\"more\"><a href=\"#{article.path}\">read on &raquo;</a></div>
        </article>"
    end
  end
end