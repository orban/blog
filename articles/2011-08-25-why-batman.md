---
title: Why Batman?
date: 25/08/2011

[Batman.js](http://batmanjs.org/), the new open source JavaScript framework of [Shopify](http://shopify.com)'s has just been released! I'm absolutely elated to introduce it to the world after spending so much time on it. Find Batman on GitHub [here](https://github.com/Shopify/batman).

Batman emerges into a world populated with extraordinary frameworks being used to great effect. With the incredible stuff being pushed out in Sproutcore 2.0 and the awesome response to DocumentCloud's 39434th awesome open source project Backbone.js, how is a developer to know what to use when? There's only so much time to play with cool new stuff, so I'd like to give a quick tour of what makes Batman different and why you might want to use it instead of the other amazing frameworks available today.

## A super duper runtime

At the heart of Batman is a runtime layer used for getting data from objects, and subscribing to events objects may emit. Batman's runtime is used similarly to SproutCore's or Backbone's in that all property access and assignment on Batman objects must be done through `object.get` and `object.set`, instead of using standard dot notation like you might in vanilla JavaScript. The benefit of this is that the incredible property system [James](http://twitter.com/jamesmacaulay) built allows objects to:

 * subscribe to events like `change` or `ready` on other objects at "deep" keypaths
 * transparently access "deep" properties which are simple data or computed by a function
 * inherit said computed properties from objects in the prototype chain
 * and most importantly, track dependencies between said properties, so computations can be cached and guaranteed to be up-to-date.

All this comes free with every Batman object, and they still play nice with vanilla JavaScript objects. Let's explore some of the things you can do with the runtime. Properties on objects can be observed using `Batman.Object::observe`:

    :::coffeescript
    crimeReport = new Batman.Object
    crimeReport.observe 'address', (newValue) ->
      if DangerTracker.isDangerous(newValue)
        crimeReport.get('currentTeam').warnOfDanger()

This kind of stuff is available in Backbone and Sproutcore both, however we've tried to bring something we missed in those frameworks to Batman: "deep" keypaths. In Batman, any keypath you supply can traverse a chain of objects by separating the keys by a `.`. For example:

    :::coffeescript
    batWatch = Batman
      currentCrimeReport: Batman
        address: Batman
          number: "123"
          street: "Easy St"
          city: "Gotham"

    batWatch.get 'currentCrimeReport.address.number' #=> "123"
    batWatch.set 'currentCrimeReport.address.number', "461A"
    batWatch.get 'currentCrimeReport.address.number' #=> "461A"


This works for observation too:

    :::coffeescript
    batWatch.observe 'currentCrimeReport.address.street', (newStreet, oldStreet) ->
      if DistanceCalculator.travelTime(newStreet, oldStreet) > 100000
        BatMobile.bringTo(batWatch.get('currentLocation'))


The craziest part of the whole thing is that deep keypath observers persist beyond the objects they were initially attached to. If you attach an observer to an object at a deep keypath, and intermediate parts of the keypath change, your observer will still be fired.

    :::coffeescript
    crimeReportA = Batman
      address: Batman
        number: "123"
        street: "Easy St"
        city: "Gotham"

    crimeReportB = Batman
      address: Batman
        number: "72"
        street: "Jolly Ln"
        city: "Gotham"

    batWatch = new Batman.Object({currentCrimeReport: crimeReportA})

    batWatch.get('currentCrimeReport.address.street') #=> "East St"
    batWatch.observe 'currentCrimeReport.address.street', (newStreet) ->
      MuggingWatcher.checkStreet(newStreet)

    batWatch.set('currentCrimeReport', crimeReportB)
    # the above callback will have been called with "Jolly Ln"

Notice what happened? Even though the middle segment of the keypath changed, the observe on the deep value persists and still fires later. This works with arbitrary length keypaths as well as intermingled `undefined` values.

The second neat part of the runtime is that because all access is done through `get` and `set`, we can track dependencies between object properties which need to be computed. Batman calls these functions `accessors`, and using the CoffeeScript executable class bodies they are really easy to define:

    :::coffeescript
    class BatWatch extends Batman.Object
      # Define an accessor for the `currentDestination` key on instances of the BatWatch class.
      @accessor 'currentDestination', ->
        address = @get 'currentCrimeReport.address'
        return "#{address.get('number')} #{address.get('street')}, #{address.get('city')}"

    crimeReport = Batman
      address: Batman
        number: "123"
        street "Easy St"
        city: "Gotham"

    watch = new BatWatch(currentCrimeReport: crimeReport)

    watch.get('currentDestination') #=> "123 Easy St, Gotham"

Importantly, the observers you may attach to these computed properties will fire as soon as you update their dependencies:

    :::coffeescript
    watch.observe 'currentDestination', (newDestination) -> console.log newDestination
    crimeReport.set('address.number', "124")
    # "124 Easy St, Gotham" will have been logged to the console

You can also define default accessors which the runtime will fall back on if an object doesn't already have a key defined. This is similar to  `method_missing` in Ruby or `doesNotUnderstand` in Smalltalk.

    :::coffeescript
    jokerSimulator = new Batman.Object
    jokerSimulator.accessor (key) -> "#{key.toUpperCase()}, HA HA HA!"

    jokerSimulator.get("why so serious") #=> "WHY SO SERIOUS, HA HA HA!"
    jokerSimulator.get('constructor')    #=> still returns Batman.Object


## What's it useful for?

The core of Batman as explained above makes it possible to know when data changes as soon as it happens. This is ideal for something like client side views. They're no longer static bundles of HTML that get cobbled together as a long string and sent to the client, they are long lived representations of data which need to change as the data does. Batman comes bundled with a view system which leverages this ability.

A simplified version of the view for [Alfred](http://batmanjs.org/examples/alfred.html), Batman's todo manager example application, lies below:

    :::html
    <h1>Alfred</h1>

    <ul id="items">
        <li data-foreach-todo="Todo.all" data-mixin="animation">
            <input type="checkbox" data-bind="todo.isDone" data-event-change="todo.save" />
            <label data-bind="todo.body" data-addclass-done="todo.isDone" data-mixin="editable"></label>
            <a data-event-click="todo.destroy">delete</a>
        </li>
        <li><span data-bind="Todo.all.length"></span> <span data-bind="'item' | pluralize Todo.all.length"></span></li>
    </ul>
    <form data-formfor-todo="controllers.todos.emptyTodo" data-event-submit="controllers.todos.create">
      <input class="new-item" placeholder="add a todo item" data-bind="todo.body" />
    </form>

We sacrifice any sort of transpiler layer (no HAML), and no template layer (no Eco, little logic). Our views are valid HTML5, rendered by the browser as soon as they have been downloaded. They aren't JavaScript strings, they are valid DOM trees which Batman traverses and populates with data, no compilation or string manipulation involved. The best part is that Batman "binds" a node's value using the observation runtime above. When the value changes in JavaScript land, the corresponding node attribute(s) bound to it update automatically. Vice versa remains true: when a user types into an input or checks a checkbox, the string or boolean is set on the bound object in JavaScript. The concept of bindings isn't new, as you may have seen it in things like Cocoa, or in [Knockout](http://knockoutjs.com/) or Sproutcore in JS land.

We chose to use bindings because we don't want to have to re-render a whole template every time one piece of data changes. With mustache or `jQuery.tmpl` and company, thats what I end up doing a lot of the time. It seems wasteful to re-render every element in a loop and pay the penalty for appending all those nodes, when only one key on one element changes. SproutCore's 'SC.TemplateView' and Yehuda Katz' Handlebars.js do a good job of mitigating this, but we still didn't want to do all the string ops in the browser, and so we opted for the surgical precision of binding all the data in the view to exactly the properties we want.

What you end up with is a fast render with no initial loading screen at the expense of expressiveness and complex logic in your views. Batman's view engine provides conditional branching, looping, context, and simple transforms, but thats about it. It forces you to write any complex interaction code in a packaged and reusable `Batman.View` subclasses, and leave the HTML rendering to the thing that does it the best: the browser.

## More?

Batman does more than this fancy deep keypath stuff and these weird HTML views-but-not-templates. We have a routing system for linking from quasi-page to quasi-page and a `Batman.Model` layer for managing data from a server, and some other handy mixins for use in your own ojects. I highly encourage you to check out the [source on GitHub](https://github.com/Shopify/batman), the [project website](http://batmanjs.org/), or visit us in [#batmanjs on freenode](irc://freenode.net/batmanjs). Any feedback or patches would be super welcome, and we're always open to suggestions on how we can make Batman better for you.

Until next time....

<iframe width="560" height="345" src="http://www.youtube.com/embed/X0UJaprpxrk" frameborder="0" allowfullscreen></iframe>
