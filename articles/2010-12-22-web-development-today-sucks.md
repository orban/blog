--- 
title: Web Development Today Sucks
date: 27/01/2011

It seems clear to me that today, web development sucks. It's hairy, scary, maybe even downright nasty. Here I'll try and explain why I think our current toolchains are inadequate, and where I think we should be going.

<div class="pleasant right small">
  <img src="/images/abominable-snowman.jpg" alt="SNOWMAN!">
  <p>I feel like this guy when making websites</p>
</div>

There is a huge disparity between all the components a high quality web developer needs to work with, which renders them inefficient and their products lower quality. The core of the problem revolves around the most exciting domain in web application development today: Javascript. The explosion of Javascript has given rise to amazing applications of stellar quality, but only from teams with gobs of time and expertise, but it leaves the average Joes like me with very little.

## A quick recap

Ruby developers write all their business logic and database interaction in Rails or Sinatra or their own way and feel right at home. They can use all the wonderful facilities local to Ruby, the Pythonistas can do the same, and everyone ends up with an application stack that does the job. These apps spit out great looking HTML, accept nothing but exactly valid data, present it back to the user in the most effective and beautiful way possible, all while keeping memory consumption at 10% and CPU usage negligible.

Then, the team or client or whoever decides that well, that fragment could be loaded using AJAX, or, hey, maybe we could add some animations to this drop down menu, or, hot damn, we should start validating stuff client side too!

This decision ushers in a new era of code duplication and implementation inconsistency. Developers must adapt their services to spit out JSON data for interpretation and rendering client side, or refactor their view code to render only fragments without layout code. We/they end up reimplementing things like the server-side validations in Javascript in both our and the users interest, but code duplication severely limits maintainability, introduces a whole new class of possible errors, and requires proficiency in all languages involved, and is therefore most undesirable. All this is possible and done often, but lots of work.

## Javascript Heavy Applications

<div class="pleasant small">
  <img src="http://www.bite.ca/wp-content/uploads/2010/12/abominable-snowman.jpg" alt="SNOWMAN!">
  <p>I feel like this guy when making websites</p>
</div>

The situation becomes hellish when you move to the SPA domain. Designing and developing a Sproutcore app from scratch is way, way more work than the mediocre static HTML Rails version providing similar functionality. You write fat models on the client side with all sorts of domain logic and requirements-fulfilling-goodness, and then you go to save them to the server, and you start pulling your hair out. Like any sane developer, you must revalidate everything server side, requiring you to revalidate all the incoming data. The dumb database-esque backend promised to you by the SPA ideals (see [Cloudkit](http://getcloudkit.com/)) can't actually be dumb or malicious users would have a field day. Before said data even gets to the server like it would in a traditional form POST, you have to design and twice implement a transport strategy to marshal and load your data across the wire. With Javascript SPAs, you must transport it, revalidate it, and then store it server side, whereas with traditional methods, you rely on the browser to do the transport, and at the last and safest moment do your validation only once.

The code repetition issues are compounded in the view layer even more. Often, applications need a way to render some data on both the server and dynamically in the client, providing graceful degradation and fast first page loads. Solutions like Mustache, where the same template language has engines in a multitude of different server side and client side languages, come to mind, but Mustache isn't nearly there. With Mustache in particular, you must define a class (on both sides, in each implementation) to manage the rendering of each individual view, which for me is still an unacceptable amount of duplication. If you pick different templating engines for the server and the browser you end up writing code twice once more. The often used solution to this issue is to do all or almost all rendering client side, which raises perceived response times for users and cripples caching's effects on user experience. UI Kits solve these issues and thus are becoming more and more prevalent, as evidenced by Sproutcore, Cappucino, Uki, and Qooxdoo's admirable efforts to bring standardized pure JS view hierarchies to the browser. These still succumb to the issues mentioned above and are prohibitively tough (right now) for your average shop to specialize in.

Also of note are tertiary symptoms like Coffeescript. Its creation and ensuing explosion onto the scene speaks worlds of our current toolset's inadequacies. As a community we've started trying to fix these issues by inventing new cool stuff on the serverside in an attempt to do as much as we can in the environment we control. Coffeescript, [therubyracer](https://github.com/cowboyd/therubyracer), [Akephalos](https://github.com/bernerdschaefer/akephalos), and [Yahoo's attempts at rendering YUI serverside](http://www.infoq.com/interviews/node-ryan-dahl#question9) all convince me of this.

## The issue and the current solutions

The issue in my mind comes down to this: *apps are already too big to write twice*. Big entities can write abstractions that fix all this business, like Google's GWT, or they can man up and pour resources into creating or enhancing the existing frameworks, like Apple and Eloqua with Sproutcore. For punks like me, none of these options are viable, but applications need to be better than they are now. The Rails for Javascript apps has yet to arrive.

## Some Successful Examples

 - [NewsBlur](http://www.newsblur.com/)

 A RSS reader SPA application written by Samuel Clay of DocumentCloud fame. Well put together, but look at the [code](https://github.com/samuelclay/NewsBlur/tree/master/media/js/)! To me it looks like it was a major pain to write. All the templating is done using `jQuery.make` and company. Its deceptively complicated and weighs in at 600KB of compressed JS.

 - [Eloqua10](http://www.eloqua.com/products/take-the-tour.html)
 
 The biggest Sproutcore app I could find outside of MobileMe. Eloqua has a couple devs as core Sproutcore devs who contributed a bunch back to the community and open sourced a lot of their UI work, but it took all that work for them to get a product out of it. I don't have to make equivalently complex and intense applications, but I still want to be able to use the framework without having to be a core team member.

 - [Gmail](http://mail.google.com/)

 An astounding accomplishment on the web today. Again, Google built the GWT so they didn't have to write code twice, but I don't want to be stuck in the Java world or be forced to learn the whole GWT and make any open source buddies of mine learn it too.
 
 - [QuietWrite](http://www.quietwrite.com/)

 A pretty basic writing app built using [Backbone.js](http://documentcloud.github.com/backbone/). Successful because its so small and can be done using Backbone and jQuery in glorious tandem. Would this work for an app twice the size? Four times?

## What can be done about it?

Rails is so successful because it forced its conventions (good ones) upon people, and people learned that being told the (one of the) right way to do something isn't so bad. I want something that applies to _both_ the server side and client side in the same way. Both sides. If someone were to make a Rails for both the client and server side, I would use it. This super framework would have these attributes:

 - Well defined and proper conventions requiring a minimum of configuration. Backbone.JS and Sproutcore both suffer from agnosticism syndrome, where they try and cater to the widest audience by not making any decisions about the backend for the developer. I am not as smart as the framework developer, so I would prefer they come up with the best solution they can for the data bottleneck, and let me work with it in the same framework.
 - Flawless and transparent code sharing between the client and the server that I don't even have to think about. If I wrote everything in the same environment, file structure, and using the same tooling, and it figured out the bare minimum to send to the client and ran it there, I would loose it. This is a monumentally difficult task as far as I can tell, but this is the killer feature. Write once, run on the continuum between the server and browser.
 - A radical departure from the jQuery mindset of DOM querying and manipulation. We aren't in Kansas any more folks, its time to go where every other platform has gone and use the language to its fullest. The DOM should become an implementation detail which is touched as little as possible, and developers should work with virtual extendable view classes as they do in Cocoa or Qt. If we want to build desktop class platforms we need to adopt similar and proven paradigms. 
 - An extensive UI Kit implementing all the stuff we are used to and then some. Building in handy stuff like sexy autocompletes or grids with searching and pagination will attract developers from the get go and give plugin developers a place to start. This stuff is traditionally plugins which makes sense in the jQuery world where one piece is needed on one page on one site out of a million. This is no longer the case though! Desktop class applications all need these types of super rich widgets. Standardizing them in the framework makes it easy to drop your data in and get desktop class functionality with rock solid reliability quickly. 
 - A gorgeous creative commons theme designed by Sofa. In my dreams.

I see an opportunity for the next DHH to rise. I wish I were talented enough to accomplish such a feat, but alas, I tripped and fell trying to climb an escalator going in the wrong direction today, and thus convinced myself I am not the man for the job. I'm also not an [ass](http://www.codinghorror.com/blog/2008/02/douchebaggery.html), but I would love a lambo.

