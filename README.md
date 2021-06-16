# Amazon Book Research Helper

Adds at-a-glance information to the top of Amazon book listings to reduce scrolling.

- [Install for Google Chrome](https://chrome.google.com/webstore/detail/cnhlmanemmekoedeblbknpodncnncbof)
- [Install for Firefox](https://addons.mozilla.org/en-US/firefox/addon/amazon-book-research-helper/)

![screenshot](https://user-images.githubusercontent.com/137158/91470233-4e2c3c80-e849-11ea-83ba-b7683e2f8cac.png)

- Shows "Self Published" if the book was self published
- Shows rank, rating, reviews, age in weeks, and reviews-per-week ratio
- Shows page count and estimated word count
- Shows file size for Kindle books
- Shows rank using Chris Fox's "tiers"
- Quick links to sales calculators for additional sales data and price and rank history
- Can expand to show author's rank in all categories

### Development

To work on this extension,

1. Clone this repo
1. In `amazon.js` change the `debug` method to use `true`
1. In `chrome://extensions`, turn on "Developer mode", click "Load unpacked", and select this directory
1. Go to an Amazon page for a book and open the dev console
1. Install the [Extensions Reloader](https://chrome.google.com/webstore/detail/fimgfedafeadlieiabdeeaodndnlbhid) extension for one-click reloading. (You have to remove the extension and re-add it if you change `manifest.json`, however.)

#### History

This extension used to use CoffeScript, jQuery and moment.js, but the Firefox store didn't like that because they don't want their extensions relying on third-party libraries or something. In 2020 I rewrote this extension to have no dependencies with help from [decaffeinate](https://github.com/decaffeinate/decaffeinate), [You Might Not Need jQuery](http://youmightnotneedjquery.com/), [You Don't Need Moment.js](https://github.com/you-dont-need/You-Dont-Need-Momentjs#parse), and [caniuse.com](https://caniuse.com/).

### Releasing

1. Make sure the book works on various localized Amazon pages. Examples:
   - [amazon.com](https://www.amazon.com/Total-Money-Makeover-Classic-Financial/dp/1595555277)
   - [amazon.co.uk](https://www.amazon.co.uk/Later-Hard-Case-Crime-Stephen/dp/1789096499)
   - [amazon.com.au](https://www.amazon.com.au/Malibu-Rising-Taylor-Jenkins-Reid/dp/1786331535/)
   - [amazon.ca](https://www.amazon.ca/Dude-Perfect-Tricks-Tips-Stuff/dp/1400217075/)
1. Update the version in `manifest.json`
1. Install [web-ext](https://github.com/mozilla/web-ext) (`npm i -g web-ext`)
1. `web-ext build`
1. Upload the .zip to Google and Firefox