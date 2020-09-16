const debug = false
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
  if (!/(Amazon )?Best(s| S)ellers Rank|Best-?sellers rank/.test(bodyText)) {
    return
  }

  let rank = null
  const info = {}
  let categories = []
  let bullets = [
    ...$$('#productDetailsTable .content > ul > li'),
    ...$$('#detailBullets_feature_div li'),
  ]
  bullets.forEach((el) => {
    let keyEl = el.querySelector('b') || el.querySelector('.a-text-bold')
    if (!keyEl) return
    let key = keyEl.innerText.replace(/\s*:\s*$/, '').trim()

    // Normalize amazon.com
    if (key === 'Best Sellers Rank') {
      key = 'Amazon Best Sellers Rank'
    }

    // Normalize amazon.co.uk
    if (key === 'Amazon Bestsellers Rank') {
      key = 'Amazon Best Sellers Rank'
    }

    const val = el.innerText.replace(/^.*?:\s*/, '')
    info[key] = val
    debug(`Detail key "${key}": "${val}"`)

    if (key === 'Amazon Best Sellers Rank') {
      categories = el.querySelectorAll('ul.zg_hrsr')
      rank = toNumber(val)
    }
  })

  if (!categories.length) {
    const el = $('#detailBullets_feature_div')
    if (!el) return
    const el2 = el.querySelectorAll('.a-unordered-list')[1]
    if (!el2) return
    categories = el2.querySelectorAll('.a-list-item > span > span')
  }

  categories = Array.from(categories).map((el) => el.cloneNode(true))
  categories.forEach((el) => {
    el.style.display = 'block'
    if (!/^\s*#/.test(el.innerText)) {
      el.insertBefore(document.createTextNode('#'), el.firstChild)
    }
  })

  if (!rank) {
    const text = $('#detailBullets_feature_div').innerText
    const match = text.match(/best.?sellers rank #?([\d,]+)/i)
    if (match) rank = toNumber(match[1])
  }

  const asin = info['ASIN']
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
  if (!author) author = $('.author .a-link-normal').cloneNode(true)
  author = author.cloneNode(true)
  author.setAttribute('target', '_blank')

  const authorRank = build(`<div class="authorRank" style="display:none">`)

  const authorExpander = build(`<span class="expand">`)
  ;(() => {
    const { host, protocol } = document.location
    const url = `${protocol}//${host}/gp/product/features/entity-teaser/books-entity-teaser-ajax.html?ASIN=${asin}`
    debug('Will fetch', url)
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        const nodes = parseHTML(data)
        const doc = nodes[0].parentNode
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

  const host = document.location.host
  const tld = host.split('.').slice(-1)[0]

  const helperEl = build('<div id="amazon-product-info-ext"/>', [
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
    rank ? rank.toLocaleString() : '?',
    ' - ',
    'Tier ',
    tier,
    build(
      '<sup><abbr title="From Chris Fox\'s &quot;Writing To Market&quot;">?</abbr></sup>'
    ),
    ' - ',
    build(
      `<a href='https://kindlepreneur.com/amazon-kdp-sales-rank-calculator/#${rank},${
        isEbook ? 1 : 0
      }'>KP</a>`
    ),
    ' - ',
    build(
      `<a href='https://www.tckpublishing.com/amazon-book-sales-calculator/#${rank},${
        isEbook ? 1 : 0
      }'>TCK</a>`
    ),
    ' - ',
    build(`<a href='https://camelcamelcamel.com/product/${asin}'>CCC</a>`),
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
    build('<div style="margin:0.6em 0" />', categories),
    build(`
      <a href="https://www.bklnk.com/categories5.php#${asin},${tld}">
        See All Categories on BKLNK...
      </a>
    `),
  ])
  $('header').appendChild(helperEl)

  // Fix for amazon.co.uk
  if ($('header.nav-flex')) {
    $('header.nav-flex').style.flexDirection = 'column'
  }

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
