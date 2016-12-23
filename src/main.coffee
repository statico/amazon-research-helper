$ = jQuery.noConflict()

$ ->

  if not /Amazon Best(s| S)ellers Rank/.test $('body').text()
    return

  d = {}
  categories = $()
  $('#productDetailsTable, #detail_bullets_id').find('.content > ul > li').each ->
    key = $(this).find('b:eq(0)').text().replace(/:$/, '').trim()
    el = $(this).clone()
    el.find('b:eq(0)').remove()
    val = el.text().trim()
    if key is 'Amazon Bestsellers Rank'
      key = 'Amazon Best Sellers Rank'
    d[key] = val
    #console.log JSON.stringify(key), '=', val.replace(/\s+/g, ' ') # XXX
    if key is 'Amazon Best Sellers Rank'
      categories = el.find('ul.zg_hrsr')

  asin = d['ASIN'] or d['ISBN-10']
  rawRank = d['Amazon Best Sellers Rank'].match(/(#[\d,]+)/)[1]
  rank = Number(rawRank?.replace(/[,#]/g,''))
  tier = if rank < 10 then '1' else \
    if rank < 100 then '2' else \
    if rank < 1000 then 'III' else \
    if rank < 10000 then 'IV' else \
    if rank < 100000 then 'V' else \
    'VI'

  author = $('.author .contributorNameID').clone().attr(target: '_blank')
  if not author.length
    author = $('.author .a-link-normal').clone().attr(target: '_blank')

  ratingAvg = Number(
    (
      $('#summaryStars a.product-reviews-link').attr('title') or
      $('#revFMSR a').attr('title')
    )?.match(/(\d+[\d\.]*)/)[1]
  )
  ratingCount = Number(
    ($('#acrCustomerReviewText').text() or $('#revSAFRLU').text()).match(/(\d+[\d\.]*)/)?[1]
  )

  publisher = if d['Publisher'] then d['Publisher'].replace(/;.*/, '') else d['Sold by']

  pubDateRaw = d['Publication Date'] or d['Publisher'].match(/\((.*)\)/)[1]
  pubDate = moment(pubDateRaw, 'MMMM D, YYYY')
  age = moment.duration(moment().diff(pubDate))

  length = d['Print Length'] or d['Paperback'] or d['Hardcover']
  words = if length then Number(length.match(/(\d+)/)[1]) * 255 else 0
  fileSize = d['File Size']

  info = $('<div id="amazon-product-info-ext"/>')
  info.appendTo 'header'
  info.append [
    "<b>#{ $('#title').text() }</b>",
    '<br/>' # ------------
    'Publisher: ', do ->
      if /Amazon\s+Digital\s+Services\s+LLC/.test(publisher)
        return '<span class=hi>Self-Published</span>'
      else
        return publisher
    ' - '
    'Author: ', $('<span class=authors/>').append(author)
    if length then " - Length: #{length} (~#{words.toLocaleString()} words)"
    if fileSize then " - Size: #{fileSize}"
    '<br/>' # ------------
    'Rank: ', rawRank
    ' - '
    'Tier ', tier
    ' - '
    "<a href='https://www.novelrank.com/asin/#{ asin }'>NovelRank</a>"
    ' - '
    'Rating: ', ratingAvg
    ' - '
    'Reviews: ', "<a href=#customerReviews>#{ ratingCount }</a>"
    ' - '
    'Age: ', "#{ Math.round(age.asWeeks()) } weeks"
    ' - '
    'Ratio: ', Number(ratingCount / age.asWeeks()).toFixed(2)
    '<br/>' # ------------
    categories
  ]

  close = $('<div/>')
  close.css(
    position: 'absolute'
    top: '10px'
    right: '10px'
  )
  close.appendTo info

  removeBtn = $('<a href="#">X</a>')
  removeBtn.css(textDecoration: 'none')
  removeBtn.on 'click', (e) ->
    info.hide()
    e.preventDefault()
  removeBtn.appendTo close

