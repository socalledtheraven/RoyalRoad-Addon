# borderify

**This add-on injects JavaScript into web pages. The `addons.mozilla.org` domain disallows this operation, so this add-on will not work properly when it's run on pages in the `addons.mozilla.org` domain.**

## What it does

This extension just includes:

* a content script, "borderify.js", that is injected into any pages
under "mozilla.org/" or any of its subdomains

The content script draws a border around the document.body.

## What it shows

* how to inject content scripts declaratively using manifest.json

## How to run

* download this repo as a zip using the three dots
* unzip it
* open up about:debugging (this will only open on firefox)
* click the This Firefox option
* click the Load Temporary Add-on button
* select any file in your extension's directory.

**Full guide by Mozilla [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension)**