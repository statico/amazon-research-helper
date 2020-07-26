/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// async {{{1

let barrier = function (count, finalCallback) {
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

const series = function (steps, finalCallback) {
  let index = 0

  var processNextStep = function (lastArgs) {
    if (lastArgs == null) {
      lastArgs = []
    }
    if (steps[index] == null) {
      const finalArgs = [null].concat(lastArgs) // (err, arg1, arg2, ...)
      finalCallback?.apply(null, finalArgs)
      return
    }

    const callback = function (err, ...args) {
      if (err != null) {
        finalCallback?.(err)
      } else {
        processNextStep(args)
      }
    }

    const nextArgs = lastArgs.concat(callback) // (arg1, arg2, ..., cb)
    steps[index++].apply(null, nextArgs)
  }

  processNextStep()
}

const parallel = function (steps, finalCallback) {
  if (steps.length === 0) {
    finalCallback?.(null)
    return
  }

  const errors = []
  let count = steps.length
  barrier = function (err) {
    if (err != null && count >= 0) {
      count = -1
      finalCallback?.(err)
    } else {
      count--
      if (count === 0) {
        finalCallback?.(null)
      }
    }
  }

  for (let step of Array.from(steps)) {
    step(barrier)
  }
}

const aWhile = function (condition, iterator, finalCallback) {
  var process = function () {
    if (!condition()) {
      finalCallback?.(null)
      return
    }
    const callback = function (err) {
      if (err != null) {
        finalCallback?.(err)
      } else {
        process()
      }
    }
    iterator(callback)
  }

  process()
}

const forEachSeries = function (array, iterator, finalCallback) {
  let index = 0
  const { length } = array
  const condition = () => index < length
  const arrayIterator = function (cb) {
    iterator(array[index++], cb)
  }
  aWhile(condition, arrayIterator, finalCallback)
}

const forEachParallel = function (array, iterator, limit, finalCallback) {
  let index
  if (finalCallback == null) {
    finalCallback = limit
    limit = Infinity
  }
  if (!array.length) {
    return finalCallback(null)
  }

  const errors = []
  let inFlight = (index = 0)

  const done = function (err) {
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

  var next = () =>
    (() => {
      const result = []
      while (inFlight < limit && index < array.length) {
        inFlight++
        result.push(iterator(array[index++], done))
      }
      return result
    })()

  next()
}

// }}}

const $ = jQuery.noConflict()

$(function () {
  let catTableButton
  if (!/Amazon Best(s| S)ellers Rank/.test($('body').text())) {
    return
  }

  const num = function (val) {
    if (typeof val === 'number') {
      return val
    }
    let m = val?.match(/(\d+[\d\.,]*)/)?.[1]
    m = m?.replace?.(/,/g, '')
    return Number(m)
  }

  const d = {}
  let categories = $()
  $('#productDetailsTable, #detail_bullets_id')
    .find('.content > ul > li')
    .each(function () {
      let key = $(this).find('b:eq(0)').text().replace(/:$/, '').trim()
      const el = $(this).clone()
      el.find('b:eq(0)').remove()
      const val = el.text().trim()
      if (key === 'Amazon Bestsellers Rank') {
        key = 'Amazon Best Sellers Rank'
      }
      d[key] = val
      //console.log JSON.stringify(key), '=', val.replace(/\s+/g, ' ') # XXX
      if (key === 'Amazon Best Sellers Rank') {
        return (categories = el.find('ul.zg_hrsr'))
      }
    })

  let allCategories = $('h2:contains("Similar Items by Category") ~ .content ul')
  if (!allCategories.length) {
    allCategories = $('h2:contains("similar items by category") ~ .content ul')
  }

  const asin = $('input[name="ASIN.0"]').val()
  let rank = num(d['Amazon Best Sellers Rank'])
  const tier =
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

  let author = $('.author .contributorNameID').clone().attr({ target: '_blank' })
  if (!author.length) {
    author = $('.author .a-link-normal').clone().attr({ target: '_blank' })
  }

  const authorRank = $('<div/>').addClass('authorRank').hide()
  const authorExpander = $('<span class=expand/>')
  ;(function () {
    const { host, protocol } = document.location
    const url = `${protocol}//${host}/gp/product/features/entity-teaser/books-entity-teaser-ajax.html?ASIN=${asin}`
    return $.get(url, function (data) {
      const els = $(data).find('.kindleAuthorRank .browseNodeRanks, .kindleAuthorRank .overallRank')
      if (els.length) {
        authorRank.append(els)
        const link = $('<a href=#>see rank</a>')
        authorExpander.append(' (', link, ')')
        return link.on('click', function (e) {
          e.preventDefault()
          authorRank.show()
          return authorExpander.hide()
        })
      }
    })
  })()

  const ratingAvg = num(
    $('#summaryStars a.product-reviews-link').attr('title') || $('#revFMSR a').attr('title') || 0
  )
  const ratingCount = num($('#acrCustomerReviewText').text() || $('#revSAFRLU').text() || 0)

  const publisher = d['Publisher'] ? d['Publisher'].replace(/;.*/, '') : d['Sold by']

  const pubDateRaw = d['Publication Date'] || d['Publisher'].match(/\((.*)\)/)[1]
  const pubDate = moment(pubDateRaw, 'MMMM D, YYYY')
  const age = moment.duration(moment().diff(pubDate))

  const length = d['Print Length'] || d['Paperback'] || d['Hardcover']
  const words = length ? num(length) * 250 : 0
  const fileSize = d['File Size']
  const isEbook = Boolean(fileSize)

  if (allCategories.length) {
    catTableButton = $(`\
<span class="a-button a-button-small"> \
<span class="a-button-inner"> \
<span class="a-button-text a-text-center">Expand ▼</span> \
</span> \
</span>\
`)
  } else {
    catTableButton = $(`\
<span class="a-button a-button-small a-button-disabled"> \
<span class="a-button-inner"> \
<span class="a-button-text a-text-center">No Additional Categories</span> \
</span> \
</span>\
`)
  }

  const info = $('<div id="amazon-product-info-ext"/>')
  info.appendTo('header')
  info.append([
    `<b>${$('#title').text()}</b>`,
    '<br/>', // ------------
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
      ? ` - Length: ${length} (~${words.toLocaleString()} words)` +
        '<sup><abbr title="Number of pages times 250 words per page">?</abbr></sup>'
      : undefined,
    fileSize ? ` - Size: ${fileSize}` : undefined,
    ' - ',
    'ASIN: ',
    asin,
    '<br/>', // ------------
    authorRank,
    'Book Rank: #',
    rank.toLocaleString(),
    ' - ',
    'Tier ',
    tier,
    '<sup><abbr title="From Chris Fox\'s &quot;Writing To Market&quot;">?</abbr></sup>',
    ' - ',
    `<a href='https://www.novelrank.com/asin/${asin}'>NovelRank</a>`,
    ' - ',
    `<a href='https://kindlepreneur.com/amazon-kdp-sales-rank-calculator/#${rank},${
      isEbook ? 1 : 0
    }'>KP</a>`,
    ' - ',
    `<a href='http://www.tckpublishing.com/amazon-book-sales-calculator/#${rank},${
      isEbook ? 1 : 0
    }'>TCK</a>`,
    ' - ',
    'Rating: ',
    ratingAvg,
    ' - ',
    'Reviews: ',
    `<a href=#customerReviews>${ratingCount.toLocaleString()}</a>`,
    ' - ',
    'Age: ',
    `${Math.round(age.asWeeks())} weeks`,
    ' - ',
    'Ratio: ',
    Number(ratingCount / age.asWeeks()).toFixed(2),
    '<sup><abbr title="Number of ratings divided by the age in weeks">?</abbr></sup>',
    '<br/>', // ------------
    $('<div class="cat-table"/>').append(
      $('<div class="cat-table-cell"/>').append(categories),
      $('<div class="cat-table-cell"/>').append(catTableButton)
    )
  ])

  const close = $('<div/>')
  close.css({
    position: 'absolute',
    top: '10px',
    right: '10px'
  })
  close.appendTo(info)

  const removeBtn = $('<a href="#">X</a>')
  removeBtn.css({ textDecoration: 'none' })
  removeBtn.on('click', function (e) {
    info.hide()
    return e.preventDefault()
  })
  removeBtn.appendTo(close)

  const fetchAllCategories = function () {
    let id
    catTableButton = catTableButton.parent()
    catTableButton.html(`\
<div class="sk-fading-circle">
  <div class="sk-circle1 sk-circle"></div>
  <div class="sk-circle2 sk-circle"></div>
  <div class="sk-circle3 sk-circle"></div>
  <div class="sk-circle4 sk-circle"></div>
  <div class="sk-circle5 sk-circle"></div>
  <div class="sk-circle6 sk-circle"></div>
  <div class="sk-circle7 sk-circle"></div>
  <div class="sk-circle8 sk-circle"></div>
  <div class="sk-circle9 sk-circle"></div>
  <div class="sk-circle10 sk-circle"></div>
  <div class="sk-circle11 sk-circle"></div>
  <div class="sk-circle12 sk-circle"></div>
</div>\
`)

    const idToRank = {}
    for (let li of Array.from($(categories).find('li'))) {
      li = $(li)
      rank = num(li.find('.zg_hrsr_rank').text())
      const crumb = li.find('.zg_hrsr_ladder')
      $(crumb.contents())[0]?.remove()
      id = num(li.find('a:last').attr('href'))
      //console.log 'XXX', id, rank, crumb.text()
      idToRank[id] = rank
    }

    categories = categories.parent()
    categories.empty().css({ textAlign: 'left' }).append(allCategories.clone().addClass('zg_hrsr'))

    const next = fn => setTimeout(fn, 500)

    return forEachSeries(
      ['BS', 'HNR'],
      (mode, outerCb) =>
        forEachSeries(
          categories.find('li'),
          function (li, cb) {
            let label
            li = $(li)
            id = Number(
              li
                .find('a[href^="/"]:last')
                .attr('href')
                .match(/node=(\d+)/)?.[1]
            )
            console.log(`looking up book in ${mode} category ${id}...`)
            if (mode === 'BS') {
              label = `<a href="https://www.amazon.com/gp/bestsellers/books/${id}" title="Best Sellers rank">BS</a>`
            } else {
              label = `<a href="https://www.amazon.com/gp/new-releases/books/${id}" title="Hot New Releases rank">HNR</a>`
            }
            if (id in idToRank && mode === 'BS') {
              console.log(`already had rank ${idToRank[id]} in preview.`)
              li.append(' - ', label, ` #${idToRank[id]}`)
              return next(cb)
            }

            let page = 1
            const { host, protocol } = document.location
            var fetch = function () {
              let url
              if (mode === 'BS') {
                url = `${protocol}//${host}/Best-Sellers-Books/zgbs/books/${id}/?_encoding=UTF8&pg=${page}&ajax=1`
              } else {
                url = `${protocol}//${host}/gp/new-releases/digital-text/${id}/?ie=UTF8&pg=${page}&ajax=1`
              }
              console.log('fetching url', url)
              return $.get(url, function (data) {
                data = $(data)
                const substr = `/${asin}/`
                const el = data.find(`a[href*='${substr}']`)
                if (el.length) {
                  rank = num(el.parents('.zg_itemImmersion').find('.zg_rankDiv').text())
                  console.log('found rank in', mode, rank)
                  li.append(' - ', label, ` #${rank}`)
                  return next(cb)
                } else if (page < 5) {
                  page++
                  console.log('trying page', page)
                  return next(fetch)
                } else {
                  console.log('asin not found')
                  rank = '>100'
                  li.append(' - ', label, ` #${rank}`)
                  return next(cb)
                }
              })
            }
            return fetch()
          },

          outerCb
        ),
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
