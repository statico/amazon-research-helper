# Amazon Book Research Helper

Adds at-a-glance information to the top of Amazon book listings to reduce scrolling. 

* [Install for Google Chrome](https://chrome.google.com/webstore/detail/cnhlmanemmekoedeblbknpodncnncbof)
* Install for Firefox (currently not available)

**2020 Update:** Not as useful as it was in 2016. This extension used to scrape _all_ categories for a book instead of just the top three, but that no longer seems possible. Also, NovelRank has shut down.

![screenshot](https://user-images.githubusercontent.com/137158/91470233-4e2c3c80-e849-11ea-83ba-b7683e2f8cac.png)

- Shows "Self Published" if the book was self published
- Shows rank, rating, reviews, age in weeks, and reviews-per-week ratio
- Shows page count and estimated word count
- Shows file size for Kindle books
- Shows rank using Chris Fox's "tiers"
- Quick links to sales calculators for additional sales data and price and rank history
- Can expand to show author's rank in all categories

### Development

Historically, this extension used CoffeScript, jQuery and moment.js, and the Firefox store didn't like that because they don't want their extensions relying on third-party libraries or something. In 20202 I rewrote this extension to have no dependencies with help from [decaffeinate](https://github.com/decaffeinate/decaffeinate), [You Might Not Need jQuery](http://youmightnotneedjquery.com/), [You Don't Need Moment.js](https://github.com/you-dont-need/You-Dont-Need-Momentjs#parse), and [caniuse.com](https://caniuse.com/).

To work on this extension,

1. Clone this repo
2. In `chrome://extensions`, turn on "Developer mode", click "Load unpacked", and select this directory
3. Go to an Amazon page for a book

Optionally, install the [Extensions Reloader](https://chrome.google.com/webstore/detail/fimgfedafeadlieiabdeeaodndnlbhid) extension for one-click reloading. (You have to remove the extension and re-add it if you change `manifest.json`, however.)