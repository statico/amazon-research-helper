const main = () => {
  const bodyText = document.body.innerText
  if (!/Amazon Best(s| S)ellers Rank/.test(bodyText)) {
    return
  }

  const toNumber = function (val) {
    if (typeof val === 'number') {
      return val
    }
    let m = val?.match(/(\d+[\d\.,]*)/)?.[1]
    m = m?.replace?.(/,/g, '')
    return Number(m)
  }

  const d = {}
  let categories = []
  document
    .querySelectorAll('#productDetailsTable, #detail_bullets_id')
    .forEach((container) => {
      container.querySelectorAll('.content > ul > li').forEach((el) => {
        let key = el.querySelector('b').replace(/:$/, '').trim()

        // Normalize amazon.co.uk
        if (key === 'Amazon Bestsellers Rank') {
          key = 'Amazon Best Sellers Rank'
        }

        d[key] = el.innerText.replace(/^.*?:\s*/, '')

        if (key === 'Amazon Best Sellers Rank') {
          return (categories = el.querySelectorAll('ul.zg_hrsr'))
        }
      })
    })

  let allCategories = $(
    'h2:contains("Similar Items by Category") ~ .content ul'
  )
  if (!allCategories.length) {
    allCategories = $('h2:contains("similar items by category") ~ .content ul')
  }

  const asin = $('input[name="ASIN.0"]').val()
  let rank = toNumber(d['Amazon Best Sellers Rank'])
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

  let author = $('.author .contributorNameID')
    .clone()
    .attr({ target: '_blank' })
  if (!author.length) {
    author = $('.author .a-link-normal').clone().attr({ target: '_blank' })
  }

  let catTableButton

  const authorRank = $('<div/>').addClass('authorRank').hide()
  const authorExpander = $('<span class=expand/>')(function () {
    const { host, protocol } = document.location
    const url = `${protocol}//${host}/gp/product/features/entity-teaser/books-entity-teaser-ajax.html?ASIN=${asin}`
    return $.get(url, function (data) {
      const els = $(data).find(
        '.kindleAuthorRank .browseNodeRanks, .kindleAuthorRank .overallRank'
      )
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

  const ratingAvg = toNumber(
    $('#summaryStars a.product-reviews-link').attr('title') ||
      $('#revFMSR a').attr('title') ||
      0
  )
  const ratingCount = toNumber(
    $('#acrCustomerReviewText').text() || $('#revSAFRLU').text() || 0
  )

  const publisher = d['Publisher']
    ? d['Publisher'].replace(/;.*/, '')
    : d['Sold by']

  const pubDateRaw =
    d['Publication Date'] || d['Publisher'].match(/\((.*)\)/)[1]
  const pubDate = moment(pubDateRaw, 'MMMM D, YYYY')
  const age = moment.duration(moment().diff(pubDate))

  const length = d['Print Length'] || d['Paperback'] || d['Hardcover']
  const words = length ? toNumber(length) * 250 : 0
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
    /Amazon\s+Digital\s+Services\s+LLC/.test(publisher)
      ? '<span class=hi>Self-Published</span>'
      : publisher,
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
    ),
  ])

  const close = $('<div/>')
  close.css({
    position: 'absolute',
    top: '10px',
    right: '10px',
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
    catTableButton.html('Loading...')

    const idToRank = {}
    for (let li of Array.from($(categories).find('li'))) {
      li = $(li)
      rank = toNumber(li.find('.zg_hrsr_rank').text())
      const crumb = li.find('.zg_hrsr_ladder')
      $(crumb.contents())[0]?.remove()
      id = toNumber(li.find('a:last').attr('href'))
      //console.log 'XXX', id, rank, crumb.text()
      idToRank[id] = rank
    }

    categories = categories.parent()
    categories
      .empty()
      .css({ textAlign: 'left' })
      .append(allCategories.clone().addClass('zg_hrsr'))

    const next = (fn) => setTimeout(fn, 500)

    forEachSeries(
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
                const el2 = data.find(`a[href*='${substr}']`)
                if (el2.length) {
                  rank = toNumber(
                    el2.parents('.zg_itemImmersion').find('.zg_rankDiv').text()
                  )
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
        catTableButton.detach()
      }
    )
  }

  if (allCategories.length) {
    catTableButton.on('click', fetchAllCategories)
  }
}

try {
  main()
} catch (err) {
  console.error(
    '%camazon-research-helper error',
    'font-size: 24px; font-weight: bold'
  )
  console.error(err)
}
