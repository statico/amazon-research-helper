var $,
  aWhile,
  barrier,
  forEachParallel,
  forEachSeries,
  parallel,
  series,
  slice = [].slice

barrier = function (count, finalCallback) {
  if (count === 0) {
    return finalCallback()
  }
  return function () {
    count--
    if (count === 0) {
      return finalCallback()
    }
  }
}

series = function (steps, finalCallback) {
  var index, processNextStep
  index = 0
  processNextStep = function (lastArgs) {
    var callback, finalArgs, nextArgs
    if (lastArgs == null) {
      lastArgs = []
    }
    if (steps[index] == null) {
      finalArgs = [null].concat(lastArgs)
      if (finalCallback != null) {
        finalCallback.apply(null, finalArgs)
      }
      return
    }
    callback = function () {
      var args, err
      ;(err = arguments[0]), (args = 2 <= arguments.length ? slice.call(arguments, 1) : [])
      if (err != null) {
        if (typeof finalCallback === 'function') {
          finalCallback(err)
        }
      } else {
        processNextStep(args)
      }
    }
    nextArgs = lastArgs.concat(callback)
    steps[index++].apply(null, nextArgs)
  }
  processNextStep()
}

parallel = function (steps, finalCallback) {
  var count, errors, i, len, step
  if (steps.length === 0) {
    if (typeof finalCallback === 'function') {
      finalCallback(null)
    }
    return
  }
  errors = []
  count = steps.length
  barrier = function (err) {
    if (err != null && count >= 0) {
      count = -1
      if (typeof finalCallback === 'function') {
        finalCallback(err)
      }
    } else {
      count--
      if (count === 0) {
        if (typeof finalCallback === 'function') {
          finalCallback(null)
        }
      }
    }
  }
  for (i = 0, len = steps.length; i < len; i++) {
    step = steps[i]
    step(barrier)
  }
}

aWhile = function (condition, iterator, finalCallback) {
  var process
  process = function () {
    var callback
    if (!condition()) {
      if (typeof finalCallback === 'function') {
        finalCallback(null)
      }
      return
    }
    callback = function (err) {
      if (err != null) {
        if (typeof finalCallback === 'function') {
          finalCallback(err)
        }
      } else {
        process()
      }
    }
    iterator(callback)
  }
  process()
}

forEachSeries = function (array, iterator, finalCallback) {
  var arrayIterator, condition, index, length
  index = 0
  length = array.length
  condition = function () {
    return index < length
  }
  arrayIterator = function (cb) {
    iterator(array[index++], cb)
  }
  aWhile(condition, arrayIterator, finalCallback)
}

forEachParallel = function (array, iterator, limit, finalCallback) {
  var done, errors, inFlight, index, next
  if (finalCallback == null) {
    finalCallback = limit
    limit = 2e308
  }
  if (!array.length) {
    return finalCallback(null)
  }
  errors = []
  inFlight = index = 0
  done = function (err) {
    if (err) {
      errors.push(err)
    }
    inFlight--
    if (inFlight === 0 && index >= array.length) {
      return finalCallback(errors.length ? errors : null)
    } else {
      return next()
    }
  }
  next = function () {
    var results
    results = []
    while (inFlight < limit && index < array.length) {
      inFlight++
      results.push(iterator(array[index++], done))
    }
    return results
  }
  next()
}

$ = jQuery.noConflict()

$(function () {
  var age,
    allCategories,
    asin,
    author,
    authorExpander,
    authorRank,
    catTableButton,
    categories,
    close,
    d,
    fetchAllCategories,
    fileSize,
    info,
    isEbook,
    length,
    num,
    pubDate,
    pubDateRaw,
    publisher,
    rank,
    ratingAvg,
    ratingCount,
    removeBtn,
    tier,
    words
  if (!/Amazon Best(s| S)ellers Rank/.test($('body').text())) {
    return
  }
  num = function (val) {
    var m, ref
    if (typeof val === 'number') {
      return val
    }
    m = val != null ? ((ref = val.match(/(\d+[\d\.,]*)/)) != null ? ref[1] : void 0) : void 0
    m = m != null ? (typeof m.replace === 'function' ? m.replace(/,/g, '') : void 0) : void 0
    return Number(m)
  }
  d = {}
  categories = $()
  $('#productDetailsTable, #detail_bullets_id')
    .find('.content > ul > li')
    .each(function () {
      var el, key, val
      key = $(this).find('b:eq(0)').text().replace(/:$/, '').trim()
      el = $(this).clone()
      el.find('b:eq(0)').remove()
      val = el.text().trim()
      if (key === 'Amazon Bestsellers Rank') {
        key = 'Amazon Best Sellers Rank'
      }
      d[key] = val
      if (key === 'Amazon Best Sellers Rank') {
        return (categories = el.find('ul.zg_hrsr'))
      }
    })
  allCategories = $('h2:contains("Similar Items by Category") ~ .content ul')
  if (!allCategories.length) {
    allCategories = $('h2:contains("similar items by category") ~ .content ul')
  }
  asin = $('input[name="ASIN.0"]').val()
  rank = num(d['Amazon Best Sellers Rank'])
  tier =
    rank < 10
      ? '1'
      : rank < 100
      ? '2'
      : rank < 1000
      ? 'III'
      : rank < 10000
      ? 'IV'
      : rank < 100000
      ? 'V'
      : 'VI'
  author = $('.author .contributorNameID').clone().attr({
    target: '_blank'
  })
  if (!author.length) {
    author = $('.author .a-link-normal').clone().attr({
      target: '_blank'
    })
  }
  authorRank = $('<div/>').addClass('authorRank').hide()
  authorExpander = $('<span class=expand/>')
  ;(function () {
    var host, protocol, ref, url
    ;(ref = document.location), (host = ref.host), (protocol = ref.protocol)
    url =
      protocol +
      '//' +
      host +
      '/gp/product/features/entity-teaser/books-entity-teaser-ajax.html?ASIN=' +
      asin
    return $.get(url, function (data) {
      var els, link
      els = $(data).find('.kindleAuthorRank .browseNodeRanks, .kindleAuthorRank .overallRank')
      if (els.length) {
        authorRank.append(els)
        link = $('<a href=#>see rank</a>')
        authorExpander.append(' (', link, ')')
        return link.on('click', function (e) {
          e.preventDefault()
          authorRank.show()
          return authorExpander.hide()
        })
      }
    })
  })()
  ratingAvg = num(
    $('#summaryStars a.product-reviews-link').attr('title') || $('#revFMSR a').attr('title') || 0
  )
  ratingCount = num($('#acrCustomerReviewText').text() || $('#revSAFRLU').text() || 0)
  publisher = d['Publisher'] ? d['Publisher'].replace(/;.*/, '') : d['Sold by']
  pubDateRaw = d['Publication Date'] || d['Publisher'].match(/\((.*)\)/)[1]
  pubDate = moment(pubDateRaw, 'MMMM D, YYYY')
  age = moment.duration(moment().diff(pubDate))
  length = d['Print Length'] || d['Paperback'] || d['Hardcover']
  words = length ? num(length) * 250 : 0
  fileSize = d['File Size']
  isEbook = Boolean(fileSize)
  if (allCategories.length) {
    catTableButton = $(
      '<span class="a-button a-button-small"> <span class="a-button-inner"> <span class="a-button-text a-text-center">Expand ▼</span> </span> </span>'
    )
  } else {
    catTableButton = $(
      '<span class="a-button a-button-small a-button-disabled"> <span class="a-button-inner"> <span class="a-button-text a-text-center">No Additional Categories</span> </span> </span>'
    )
  }
  info = $('<div id="amazon-product-info-ext"/>')
  info.appendTo('header')
  info.append([
    '<b>' + $('#title').text() + '</b>',
    '<br/>',
    'Publisher: ',
    (function () {
      if (/Amazon\s+Digital\s+Services\s+LLC/.test(publisher)) {
        return '<span class=hi>Self-Published</span>'
      } else {
        return publisher
      }
    })(),
    ' - ',
    'Author: ',
    $('<span class=authors/>').append(author),
    authorExpander,
    length
      ? ' - Length: ' +
        length +
        ' (~' +
        words.toLocaleString() +
        ' words)' +
        '<sup><abbr title="Number of pages times 250 words per page">?</abbr></sup>'
      : void 0,
    fileSize ? ' - Size: ' + fileSize : void 0,
    ' - ',
    'ASIN: ',
    asin,
    '<br/>',
    authorRank,
    'Book Rank: #',
    rank.toLocaleString(),
    ' - ',
    'Tier ',
    tier,
    '<sup><abbr title="From Chris Fox\'s &quot;Writing To Market&quot;">?</abbr></sup>',
    ' - ',
    "<a href='https://www.novelrank.com/asin/" + asin + "'>NovelRank</a>",
    ' - ',
    "<a href='https://kindlepreneur.com/amazon-kdp-sales-rank-calculator/#" +
      rank +
      ',' +
      (isEbook ? 1 : 0) +
      "'>KP</a>",
    ' - ',
    "<a href='http://www.tckpublishing.com/amazon-book-sales-calculator/#" +
      rank +
      ',' +
      (isEbook ? 1 : 0) +
      "'>TCK</a>",
    ' - ',
    'Rating: ',
    ratingAvg,
    ' - ',
    'Reviews: ',
    '<a href=#customerReviews>' + ratingCount.toLocaleString() + '</a>',
    ' - ',
    'Age: ',
    Math.round(age.asWeeks()) + ' weeks',
    ' - ',
    'Ratio: ',
    Number(ratingCount / age.asWeeks()).toFixed(2),
    '<sup><abbr title="Number of ratings divided by the age in weeks">?</abbr></sup>',
    '<br/>',
    $('<div class="cat-table"/>').append(
      $('<div class="cat-table-cell"/>').append(categories),
      $('<div class="cat-table-cell"/>').append(catTableButton)
    )
  ])
  close = $('<div/>')
  close.css({
    position: 'absolute',
    top: '10px',
    right: '10px'
  })
  close.appendTo(info)
  removeBtn = $('<a href="#">X</a>')
  removeBtn.css({
    textDecoration: 'none'
  })
  removeBtn.on('click', function (e) {
    info.hide()
    return e.preventDefault()
  })
  removeBtn.appendTo(close)
  fetchAllCategories = function () {
    var crumb, i, id, idToRank, len, li, next, ref, ref1
    catTableButton = catTableButton.parent()
    catTableButton.html(
      '<div class="sk-fading-circle">\n  <div class="sk-circle1 sk-circle"></div>\n  <div class="sk-circle2 sk-circle"></div>\n  <div class="sk-circle3 sk-circle"></div>\n  <div class="sk-circle4 sk-circle"></div>\n  <div class="sk-circle5 sk-circle"></div>\n  <div class="sk-circle6 sk-circle"></div>\n  <div class="sk-circle7 sk-circle"></div>\n  <div class="sk-circle8 sk-circle"></div>\n  <div class="sk-circle9 sk-circle"></div>\n  <div class="sk-circle10 sk-circle"></div>\n  <div class="sk-circle11 sk-circle"></div>\n  <div class="sk-circle12 sk-circle"></div>\n</div>'
    )
    idToRank = {}
    ref = $(categories).find('li')
    for (i = 0, len = ref.length; i < len; i++) {
      li = ref[i]
      li = $(li)
      rank = num(li.find('.zg_hrsr_rank').text())
      crumb = li.find('.zg_hrsr_ladder')
      if ((ref1 = $(crumb.contents())[0]) != null) {
        ref1.remove()
      }
      id = num(li.find('a:last').attr('href'))
      idToRank[id] = rank
    }
    categories = categories.parent()
    categories
      .empty()
      .css({
        textAlign: 'left'
      })
      .append(allCategories.clone().addClass('zg_hrsr'))
    next = function (fn) {
      return setTimeout(fn, 500)
    }
    return forEachSeries(
      ['BS', 'HNR'],
      function (mode, outerCb) {
        return forEachSeries(
          categories.find('li'),
          function (li, cb) {
            var fetch, host, label, page, protocol, ref2, ref3
            li = $(li)
            id = Number(
              (ref2 = li
                .find('a[href^="/"]:last')
                .attr('href')
                .match(/node=(\d+)/)) != null
                ? ref2[1]
                : void 0
            )
            console.log('looking up book in ' + mode + ' category ' + id + '...')
            if (mode === 'BS') {
              label =
                '<a href="https://www.amazon.com/gp/bestsellers/books/' +
                id +
                '" title="Best Sellers rank">BS</a>'
            } else {
              label =
                '<a href="https://www.amazon.com/gp/new-releases/books/' +
                id +
                '" title="Hot New Releases rank">HNR</a>'
            }
            if (id in idToRank && mode === 'BS') {
              console.log('already had rank ' + idToRank[id] + ' in preview.')
              li.append(' - ', label, ' #' + idToRank[id])
              return next(cb)
            }
            page = 1
            ;(ref3 = document.location), (host = ref3.host), (protocol = ref3.protocol)
            fetch = function () {
              var url
              if (mode === 'BS') {
                url =
                  protocol +
                  '//' +
                  host +
                  '/Best-Sellers-Books/zgbs/books/' +
                  id +
                  '/?_encoding=UTF8&pg=' +
                  page +
                  '&ajax=1'
              } else {
                url =
                  protocol +
                  '//' +
                  host +
                  '/gp/new-releases/digital-text/' +
                  id +
                  '/?ie=UTF8&pg=' +
                  page +
                  '&ajax=1'
              }
              console.log('fetching url', url)
              return $.get(url, function (data) {
                var el, substr
                data = $(data)
                substr = '/' + asin + '/'
                el = data.find("a[href*='" + substr + "']")
                if (el.length) {
                  rank = num(el.parents('.zg_itemImmersion').find('.zg_rankDiv').text())
                  console.log('found rank in', mode, rank)
                  li.append(' - ', label, ' #' + rank)
                  return next(cb)
                } else if (page < 5) {
                  page++
                  console.log('trying page', page)
                  return next(fetch)
                } else {
                  console.log('asin not found')
                  rank = '>100'
                  li.append(' - ', label, ' #' + rank)
                  return next(cb)
                }
              })
            }
            return fetch()
          },
          outerCb
        )
      },
      function () {
        console.log('done')
        return catTableButton.detach()
      }
    )
  }
  if (allCategories.length) {
    return catTableButton.on('click', fetchAllCategories)
  }
})
