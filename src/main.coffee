$ = jQuery.noConflict()

$ ->

  if not /Amazon Best Sellers Rank/.test $('body').text()
    return

  details = {}
  categories = $()
  $('#productDetailsTable .content > ul > li').each ->
    key = $(this).find('b:eq(0)').text().replace(/:$/, '').trim()
    el = $(this).clone()
    el.find('b:eq(0)').remove()
    val = el.text().trim()
    details[key] = val
    #console.log key, ' = ', val.replace(/\s+/g, ' ') # XXX
    if key = 'Amazon Best Sellers Rank'
      categories = el.find('ul.zg_hrsr')

  asin = details['ASIN'] or details['ISBN-10']
  rawRank = details['Amazon Best Sellers Rank'].match(/(#[\d,]+)/)[1]
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

  ratingAvg = Number($('#summaryStars a.product-reviews-link').attr('title')?.match(/([\d\.]+)/)[1])
  ratingCount = Number($('#acrCustomerReviewText').text().match(/([\d\.]+)/)?[1])

  publisher = if details['Publisher'] then details['Publisher'].replace(/;.*/, '') else details['Sold by']

  pubDateRaw = details['Publication Date'] or details['Publisher'].match(/\((.*)\)/)[1]
  pubDate = moment(pubDateRaw, 'MMMM D, YYYY')
  age = moment.duration(moment().diff(pubDate))

  length = details['Print Length'] or details['Paperback'] or details['Hardcover']
  words = if length then Number(length.match(/(\d+)/)[1]) * 255 else 0
  fileSize = details['File Size']

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
    if length then " - Length: #{length} (~#{words} words)"
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

