const debug = true
  ? (...args) => {
      console.log(
        `%c${args.join(' ')}`,
        'background-color: #a7f6fa; color: #111; padding: 2px;'
      )
    }
  : () => {}

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const parseHTML = function (str) {
  const doc = new DOMParser().parseFromString(str, 'text/html')
  return Array.from(doc.body.childNodes)
}

const build = (html, children) => {
  const container = parseHTML(html)[0]
  console.log('XXX', html, container, children)
  if (children)
    Array.from(children)
      .map((el) =>
        typeof el === 'string'
          ? document.createTextNode(el)
          : typeof el === 'number'
          ? document.createTextNode(String(el))
          : el
      )
      .forEach((el) => container.appendChild(el))
  return container
}

const toNumber = function (val) {
  if (typeof val === 'number') {
    return val
  }
  let m = val?.match(/(\d+[\d\.,]*)/)?.[1]
  m = m?.replace?.(/,/g, '')
  return Number(m)
}

const main = () => {
  const bodyText = document.body.innerText
  if (!/Amazon Best(s| S)ellers Rank/.test(bodyText)) {
    return
  }

  const info = {}
  let categories = []
  document
    .querySelectorAll('#productDetailsTable, #detail_bullets_id')
    .forEach((container) => {
      container.querySelectorAll('.content > ul > li').forEach((el) => {
        let keyEl = el.querySelector('b')
        if (!keyEl) return
        let key = keyEl.innerText.replace(/:$/, '').trim()

        // Normalize amazon.co.uk
        if (key === 'Amazon Bestsellers Rank') {
          key = 'Amazon Best Sellers Rank'
        }

        const val = el.innerText.replace(/^.*?:\s*/, '')
        info[key] = val
        debug(`Detail key "${key}": "${val}"`)

        if (key === 'Amazon Best Sellers Rank') {
          return (categories = el.querySelectorAll('ul.zg_hrsr'))
        }
      })
    })

  let allCategories = [] // XXXXXXXXXXXXXXXXXx
  // let allCategories = $$(
  //   'h2:contains("Similar Items by Category") ~ .content ul'
  // )
  // if (!allCategories.length) {
  //   allCategories = $$('h2:contains("similar items by category") ~ .content ul')
  // }

  const asin = info['ASIN']
  let rank = toNumber(info['Amazon Best Sellers Rank'])
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

  let author = $('.author .contributorNameID').cloneNode(true)
  if (!author.length) {
    author = $('.author .a-link-normal').cloneNode(true)
  }
  author.setAttribute('target', '_blank')

  let catTableButton

  const authorRank = build(`<div class="authorRank" style="display:none">`)

  const authorExpander = build(`<span class="expand">`)
  ;(() => {
    const { host, protocol } = document.location
    const url = `${protocol}//${host}/gp/product/features/entity-teaser/books-entity-teaser-ajax.html?ASIN=${asin}`
    debug('Will fetch', url)
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        const doc = parseHTML(data)
        const els = doc.querySelectorAll(
          '.kindleAuthorRank .browseNodeRanks, .kindleAuthorRank .overallRank'
        )
        if (els.length) {
          authorRank.append(els)
          const link = build('<a href="#">see rank</a>')
          // const link = document.createElement('a')
          // link.innerText = 'see rank'
          authorExpander.innerHTML += ' ('
          authorExpander.append(link)
          authorExpander.innerHTML += ')'
          link.addEventListener('click', function (e) {
            e.preventDefault()
            authorRank.style.display = null
            authorExpander.style.display = 'none'
          })
        }
      })
  })()

  const ratingAvgEl1 = $('#acrPopover')
  const ratingAvgEl2 = $('#revFMSR a')
  const ratingAvg = toNumber(
    ratingAvgEl1
      ? ratingAvgEl1.getAttribute('title').replace(/\s.*/, '')
      : ratingAvgEl2
      ? ratingAvgEl2.getAttribute('title')
      : 0
  )
  debug('ratingAvg', ratingAvg)

  const ratingCountEl1 = $('#acrCustomerReviewText')
  const ratingCountEl2 = $('#revSAFRLU')
  const ratingCount = toNumber(
    ratingCountEl1
      ? ratingCountEl1.innerText
      : ratingCountEl2
      ? ratingCountEl2.innerText
      : 0
  )
  debug('ratingCount', ratingCount)

  const publisher = info['Publisher']
    ? info['Publisher'].replace(/;.*/, '')
    : info['Sold by']

  const pubDateRaw =
    info['Publication Date'] || info['Publisher'].match(/\((.*)\)/)[1]
  debug('pubDateRaw', pubDateRaw)
  const pubDate = new Date(pubDateRaw)
  debug('pubDate', pubDate)
  const diff = new Date() - new Date(pubDate)
  const ageInWeeks = diff / 1000 / 60 / 60 / 24 / 7

  const length = info['Print Length'] || info['Paperback'] || info['Hardcover']
  const words = length ? toNumber(length) * 250 : 0
  const fileSize = info['File Size']
  const isEbook = Boolean(fileSize)

  if (allCategories.length) {
    catTableButton = build(`
      <span class="a-button a-button-small">
        <span class="a-button-inner">
          <span class="a-button-text a-text-center">Expand ▼</span>
        </span>
      </span>
    `)
  } else {
    catTableButton = build(`
      <span class="a-button a-button-small a-button-disabled"> 
        <span class="a-button-inner"> 
          <span class="a-button-text a-text-center">No Additional Categories</span> 
        </span> 
      </span>
    `)
  }

  const helperEl = build(
    '<div id="amazon-product-info-ext" style="margin-bottom:10px"/>',
    [
      build(`<b>${$('#title').innerText}</b>`),
      build('<br/>'), // ------------
      'Publisher: ',
      build(
        /Amazon\s+Digital\s+Services\s+LLC/.test(publisher)
          ? '<span class=hi>Self-Published</span>'
          : publisher
      ),
      ' - ',
      'Author: ',
      build('<span class="authors"/>', [author]),
      authorExpander,
      length
        ? build(
            `&nbsp;- Length: ${length} (~${words.toLocaleString()} words)` +
              '<sup><abbr title="Number of pages times 250 words per page">?</abbr></sup>'
          )
        : '',
      fileSize ? ` - Size: ${fileSize}` : '',
      ' - ',
      'ASIN: ',
      asin,
      build('<br/>'), // ------------
      authorRank,
      'Book Rank: #',
      rank.toLocaleString(),
      ' - ',
      'Tier ',
      tier,
      build(
        '<sup><abbr title="From Chris Fox\'s &quot;Writing To Market&quot;">?</abbr></sup>'
      ),
      ' - ',
      build(`<a href='https://www.novelrank.com/asin/${asin}'>NovelRank</a>`),
      ' - ',
      build(
        `<a href='https://kindlepreneur.com/amazon-kdp-sales-rank-calculator/#${rank},${
          isEbook ? 1 : 0
        }'>KP</a>`
      ),
      ' - ',
      build(
        `<a href='http://www.tckpublishing.com/amazon-book-sales-calculator/#${rank},${
          isEbook ? 1 : 0
        }'>TCK</a>`
      ),
      ' - ',
      'Rating: ',
      ratingAvg,
      ' - ',
      'Reviews: ',
      build(`<a href=#customerReviews>${ratingCount.toLocaleString()}</a>`),
      ' - ',
      'Age: ',
      `${Math.round(ageInWeeks)} weeks`,
      ' - ',
      'Rvws/Wk: ',
      Number(ratingCount / ageInWeeks).toFixed(2),
      build('<br/>'), // ------------
      build('<div class="cat-table"/>', [
        build('<div class="cat-table-cell"/>', categories),
        build('<div class="cat-table-cell"/>', [catTableButton]),
      ]),
    ]
  )
  $('header').appendChild(helperEl)

  const close = build(
    '<div style="position: absolute; top: 10px; right: 10px"/>'
  )
  helperEl.appendChild(close)

  const removeBtn = build('<a href="#" style="text-decoration:none">X</a>')
  removeBtn.addEventListener('click', (event) => {
    event.preventDefault()
    helperEl.style.display = 'none'
  })
  close.appendChild(removeBtn)

  // const fetchAllCategories = function () {
  //   let id
  //   catTableButton = catTableButton.parentElement
  //   catTableButton.innerText = 'Loading...'

  //   const idToRank = {}
  //   for (let li of Array.from(categories.querySelectorAll('li'))) {
  //     const f = li.querySelector.bind(li)
  //     rank = toNumber(li.f('.zg_hrsr_rank').innerText)
  //     const crumb = li.f('.zg_hrsr_ladder')
  //     // $(crumb.contents())[0]?.remove() TODO XXXXXXXXXXXx
  //     id = toNumber(li.f('a:last').getAttribute('href'))
  //     idToRank[id] = rank
  //   }

  //   // TODO vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
  //   categories = categories.parent()
  //   categories
  //     .empty()
  //     .css({ textAlign: 'left' })
  //     .append(allCategories.clone().addClass('zg_hrsr'))

  //   const next = (fn) => setTimeout(fn, 500)

  //   forEachSeries(
  //     ['BS', 'HNR'],
  //     (mode, outerCb) =>
  //       forEachSeries(
  //         categories.find('li'),
  //         function (li, cb) {
  //           let label
  //           li = $(li)
  //           id = Number(
  //             li
  //               .find('a[href^="/"]:last')
  //               .attr('href')
  //               .match(/node=(\d+)/)?.[1]
  //           )
  //           console.log(`looking up book in ${mode} category ${id}...`)
  //           if (mode === 'BS') {
  //             label = `<a href="https://www.amazon.com/gp/bestsellers/books/${id}" title="Best Sellers rank">BS</a>`
  //           } else {
  //             label = `<a href="https://www.amazon.com/gp/new-releases/books/${id}" title="Hot New Releases rank">HNR</a>`
  //           }
  //           if (id in idToRank && mode === 'BS') {
  //             console.log(`already had rank ${idToRank[id]} in preview.`)
  //             li.append(' - ', label, ` #${idToRank[id]}`)
  //             return next(cb)
  //           }

  //           let page = 1
  //           const { host, protocol } = document.location
  //           var fetch = function () {
  //             let url
  //             if (mode === 'BS') {
  //               url = `${protocol}//${host}/Best-Sellers-Books/zgbs/books/${id}/?_encoding=UTF8&pg=${page}&ajax=1`
  //             } else {
  //               url = `${protocol}//${host}/gp/new-releases/digital-text/${id}/?ie=UTF8&pg=${page}&ajax=1`
  //             }
  //             console.log('fetching url', url)
  //             return $.get(url, function (data) {
  //               data = $(data)
  //               const substr = `/${asin}/`
  //               const el2 = data.find(`a[href*='${substr}']`)
  //               if (el2.length) {
  //                 rank = toNumber(
  //                   el2.parents('.zg_itemImmersion').find('.zg_rankDiv').text()
  //                 )
  //                 console.log('found rank in', mode, rank)
  //                 li.append(' - ', label, ` #${rank}`)
  //                 return next(cb)
  //               } else if (page < 5) {
  //                 page++
  //                 console.log('trying page', page)
  //                 return next(fetch)
  //               } else {
  //                 console.log('asin not found')
  //                 rank = '>100'
  //                 li.append(' - ', label, ` #${rank}`)
  //                 return next(cb)
  //               }
  //             })
  //           }
  //           return fetch()
  //         },

  //         outerCb
  //       ),
  //     function () {
  //       console.log('done')
  //       catTableButton.detach()
  //     }
  //   )
  // }

  // if (allCategories.length) {
  //   catTableButton.on('click', fetchAllCategories)
  // }
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
