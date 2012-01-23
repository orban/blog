---
title: JavaScript Documentation Sucks
date: 22/01/2012

I want to use your JavaScript library. I really do.

Unfortunately, you are most bad at documenting it, so I can't figure out how to use it before I give up and find something easier to learn.

If you use docco, this is because you write your documentation in the same way you write your code. Like a good little hacker you write your code with the design goal of making it easy for the next person working on the project, and only after that for the other computer-y audience. You strive to structure your design and code so that new functionality can be bolted on, or stuff messed with to make the whole thing faster. Only after this do you begin to concern yourself with how the computer will interpret it and how work will get done. This is awesome. Maintainable and readable code is awesome. In an effort to make it even more awesome, you start leaving some comments around. You say to yourself, well golly gee shucks, it would be nice if I had a reminder that this function's boolean argument indicates this or that; or maybe it would be nice to remember what all these RegExp back-references which I've rarely used before actually mean.

The problem is this: these comments are oriented at someone trying to understand the code, not just use it. Someone looking to know how to use the function cares not that it calls out to something which takes a boolean parameter. Someone looking to instantiate a class to get work done cares not that some part of it uses a RegExp to accomplish its tasks. What someone does care about is the API that class or function exposes, and what work it does that is helpful. The whole point of abstracting something useful into a library is that I don't have to write that code myself when I use it, instead I can understand only the surface of it, and rely on you to have done a good job implementing the thing. I don't want to have to read through the whole piece of code to understand how to call into it. You've structured it for a developer looking to change it, not to use it, so I get lost, and your explanatory comments usually don't tell me function signatures or typical ways I might call them. It doesn't make sense to make someone who wants to consume your library have to traverse your one monolithic HTML page to find the one stupid function signature they are looking for.

So, for things that aren't quick and dirty, I don't like docco. If you want to generate awesome docs meant for consumption by people hacking on the project, by all means, use docco. I really don't like people thinking docco or dox[1] can be used for API documentation however. I believe this was never its intended purpose, but it certainly has been repurposed for this. Perhaps developers feel that docco and company are suitable for creating API documentation because they are the high visibility tools available in the JavaScript ecosystem. I think the problem is even more insidious than this however. There are some, like TJ Holowaychuck, who go the opposite route, and orient their comments for consumers using JSDoc or similar. Based on my admittedly subjective and imperfect knowledge of the ecosystem I think most people don't like JSDoc. The number of libraries which use JSDoc or Doxygen or whichever Javadoc-eqsue tool is pitiful compared to the way RDoc and/or YARD are trumpeted to great success in the Ruby community.

The relatively low adoption is disappointing in that many libraries go undocumented, however I still won't use JSDoc for my projects, and I suggest you don't either. I think it's absolutely insane to have a 10 to 1 comment to code ratio in a file. It is outrageous to expect developers to work in files where each function has been meticulously explained, with all the available options listed and explained, as well as  numerous examples of usage, all in a comment block just above the definition. Class bodies end up being enormous, and you can't fit a function body and the body of those called in the first body on the same screen. I find scrolling through the grey molasses terribly inefficient when trying to reason about or work on the code at hand.

You may say, Harry, these comments are wonderful, because we will change our comments when the code changes; they are right there, they will be in sync! I absolutely concede this: the closer the words for humans are to the words for the computer the easier a job we will have of keeping them accurate during change. Harry, you might say, now I can declare the types I expect my arguments to have and people can provide them. Harry, smart IDEs could even verify these types! I can almost pretend its a statically typed language! Again, you have a point, this information is valuable both to the library hacker and the library consumer. Harry, you say, use an editor where you can ignore comments or fold them. I say back at you: vim folds are hard, and I am lazy.

To me, the clutter is simply not worth the advantages. We should design code such that the next man or woman coming along can edit it and succeed. We should not sacrifice their chances of success by making them work in and around the screen filling quicksand comment blocks. The code is the uniquely canonical specification for how it can be used. It implicitly declares all of its use cases, but it doesn't have to go ahead and be explicit about all those use cases by talking about them at length inline. It is essential that these examples and signatures and use cases are found somewhere, but I make the conscious decision to move my consumer documentation out of the code such that the code can be clear and unencumbered. Some project owners create gargantuan READMEs, or HTML guide style documentation, or GitHub wikis that these signatures and examples and whatnot look amazing inside. The shining examples from my world are the Django docs, the Rails Guides (and recently the SproutCore guides), and inside the JS world the Mongoose, Express, and Testling documentation sites. These are all curated sets of prose and code examples of how to use a piece of software. The problem comes down to actually creating them, and continuing to maintain it after it's been released. APIs inevitably change, so docs inevitably go out of date. The worst aspect is that developers may not make changes because it is twice as much work as it might be normally. You must write the test, write the code, and now find all the places that code is referenced in the docs and change them. There are of course notable exceptions, but in JavaScript community I find myself learning how to use something from it's README, and then spelunking in the code to find out the nuances.

This isn't really so bad. If it were, better tools would have evolved. But for now, people either publish annotated source or pour their hearts into markdown'd READMEs or static sites. The annotated source isn't a good reference for the reason's I've mentioned above. My question is: what happens when the system in question gets more complicated?
