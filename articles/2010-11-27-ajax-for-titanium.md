--- 
title: $.ajax for Titanium
date: 27/11/2010

[Appcelerator's Titanium](http://www.appcelerator.com/) is a good way to make native applications fast. I use it because I'm able to leverage a set of web development and Javascript skills I already have while making a new class of application. However, I'm used to the cushy world of rapid development frameworks like Rails and jQuery, so in my other life as a native application developer I miss things like jQuery's `$.ajax` for making HTTP requests quickly.

Titanium provides an almost complete implementation of the same XMLHttpRequest object web devs are used to using inside the browser, but without any of the cross domain sandboxing safties. Using this just like the one from the web, we can use the jQuery ajax wrapper to write ajax code quickly and maintainably.

## Code
 Download the `tiajax.js` file from [Github](https://github.com/hornairs/titanium_ajax). Source it in your `app.js` file and you should be good to go!

## Usage
	Use `Titanium.Network.ajax()` just like `jQuery.ajax`. Documentation is available at the [jQuery API docs].
