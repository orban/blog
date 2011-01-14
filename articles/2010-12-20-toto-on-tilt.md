--- 
title: Toto on Tilt
date: 20/12/2010

[toto](https://github.com/cloudhead/toto) is a handly little blogging engine designed for hackers, written by [Alexis Sellier](http://cloudhead.io/). My blog runs on it too, because it was super easy to set up and was just handy enough without getting in the way. In this post I'll try and show you how I got my toto installation to render all sorts of different templates using a library called Tilt. 

![Haml is pretty cool I guess maybe](http://haml-lang.com/images/haml.gif)

I've been using the [Haml](http://haml-lang.com/) markup language and templating engine for some stuff here and there, and I wanted to use it for my toto powered blog. There are some [instructions](https://github.com/cloudhead/toto/wiki/Use-HAML-to-render-your-layout-and-pages) on configuring toto to render pages and layouts using Haml, but I opted for a resuable, pluggable solution. Tilt is a useful template engine abstraction library written by [Ryan Tomayko](http://tomayko.com/about), where you pass it a filename and it will render the view using whatever engine it can. Once Tilt is integrated, you can use any of the engines it supports, instead of being limited to one or writing logic to decide between several.

Getting toto to use Tilt isn't hard at all. I opted to monkey patch one tiny piece of it. This is a truely dastardly, evil, deed, which no one should ever attempt and I should be mamed permanently for. I needed an extra peiece of information from toto's configuration handlers, so sorry about that. Be aware that this may break future versions of toto, and please do suggest a way to set all of this up without monkeypatching if you can think of one!

## Actually Doing It

First, I added a `blog.rb` file and required it in my `config.ru`. In here, I reopened the `Toto::Template` class and added that extra peice of information to the templating engine call nessecary for Tilt.

<script src="https://gist.github.com/748748.js"> </script>

For the curious, this extra argument is a pointer to the block that would be run by the `yield` statement in the template. `Toto::Context` is used for each request to render the layout, which `yields` a block to render the actual content for the page. Both the layout and page specific template are rendered by the `Toto::Config.to_html` option, which is by default a proc which reads the template file and has the call to ERB's `render` it. Alexis used a feature I'd never heard of in Ruby before to pass the toto context to this ERB template handler, [`Kernel#binding`](http://ruby-doc.org/core/classes/Binding.html). Calling `binding` anywhere in Ruby code returns an objectified reference to that scope of code, which can then be passed to things like `eval` in order to evaluate things in a certain scope. The toto-default ERB handler accepts a `Binding` instance as its evaluation scope, so we can pass in the Toto object and give our templates access to the articles and configuration information. Tilt doesn't quite work the same way. Instead of accepting a `Binding` instance, it takes any object and then `instance_eval`'s inside of it in order to scope the rendering of the template properly. I wasn't able to figure out how to get the scope of the `Binding` object while retaining reference to the block passed to the `Toto::Template#to_html` method, so I pass a pointer to the block explicitly. Big change right?

Next, we change our `to_html` toto configuration option to render templates using Tilt. In `config.ru`, you must add/change the `set :to_html` line in the `Toto::Server.new` block to something that looks like this:

<script src="https://gist.github.com/748777.js"> </script>

This `to_html` configuration option tries to render the first template matching the request url using Tilt, passing it the proper context and block to use for yield statements. If no templates are rendered (and execution continues past the `Dir.glob` loop), we raise an exception. This is caught by toto and returns a 404 status to the client requesting the non existant page.

Thats all! Other fun stuff would be to serve up Coffeescript using Tilt or to add a small layer to concatenate assets to reduce load times a la [Stagecoach](https://github.com/josh/stagecoach). Until next time!
