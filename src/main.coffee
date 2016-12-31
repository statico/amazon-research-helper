# async {{{1

barrier = (count, finalCallback) ->
  return finalCallback() if count == 0
  return ->
    count--
    finalCallback() if count == 0

series = (steps, finalCallback) ->
  index = 0

  processNextStep = (lastArgs = []) ->
    if not steps[index]?
      finalArgs = [null].concat(lastArgs) # (err, arg1, arg2, ...)
      finalCallback?.apply null, finalArgs
      return

    callback = (err, args...) ->
      if err?
        finalCallback? err
      else
        processNextStep args
      return

    nextArgs = lastArgs.concat(callback) # (arg1, arg2, ..., cb)
    steps[index++].apply null, nextArgs
    return

  processNextStep()
  return

parallel = (steps, finalCallback) ->
  if steps.length == 0
    finalCallback? null
    return

  errors = []
  count = steps.length
  barrier = (err) ->
    if err? and count >= 0
      count = -1
      finalCallback? err
    else
      count--
      if count == 0
        finalCallback? null
    return

  for step in steps
    step barrier

  return

aWhile = (condition, iterator, finalCallback) ->
  process = ->
    if not condition()
      finalCallback? null
      return
    callback = (err) ->
      if err?
        finalCallback? err
      else
        process()
      return
    iterator callback
    return

  process()
  return

forEachSeries = (array, iterator, finalCallback) ->
  index = 0
  length = array.length
  condition = ->
    return index < length
  arrayIterator = (cb) ->
    iterator array[index++], cb
    return
  aWhile condition, arrayIterator, finalCallback
  return

forEachParallel = (array, iterator, limit, finalCallback) ->
  if not finalCallback?
    finalCallback = limit
    limit = Infinity
  return finalCallback(null) unless array.length

  errors = []
  inFlight = index = 0

  done = (err) ->
    errors.push err if err
    inFlight--
    if inFlight == 0 and index >= array.length
      finalCallback(if errors.length then errors else null)
    else
      next()

  next = ->
    while inFlight < limit and index < array.length
      inFlight++
      iterator array[index++], done

  next()
  return

# }}}

$ = jQuery.noConflict()

$ ->

  if not /Amazon Best(s| S)ellers Rank/.test $('body').text()
    return

  num = (val) ->
    return val if typeof val is 'number'
    m = val?.match(/(\d+[\d\.,]*)/)?[1]
    m = m?.replace?(/,/g, '')
    return Number(m)

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

  allCategories = $('h2:contains("Similar Items by Category") ~ .content ul')
  if not allCategories.length
    allCategories = $('h2:contains("similar items by category") ~ .content ul')

  asin = $('input[name="ASIN.0"]').val()
  rank = num d['Amazon Best Sellers Rank']
  tier = if rank < 10 then '1' else \
    if rank < 100 then '2' else \
    if rank < 1000 then 'III' else \
    if rank < 10000 then 'IV' else \
    if rank < 100000 then 'V' else \
    'VI'

  author = $('.author .contributorNameID').clone().attr(target: '_blank')
  if not author.length
    author = $('.author .a-link-normal').clone().attr(target: '_blank')

  authorRank = $('<div/>').addClass('authorRank').hide()
  authorExpander = $('<span class=expand/>')
  do ->
    {host, protocol} = document.location
    url =  "#{protocol}//#{host}/gp/product/features/entity-teaser/books-entity-teaser-ajax.html?ASIN=#{asin}"
    $.get url, (data) ->
      els = $(data).find('.kindleAuthorRank .browseNodeRanks, .kindleAuthorRank .overallRank')
      if els.length
        authorRank.append els
        link = $('<a href=#>see rank</a>')
        authorExpander.append ' (', link, ')'
        link.on 'click', (e) ->
          e.preventDefault()
          authorRank.show()
          authorExpander.hide()

  ratingAvg = num(
    $('#summaryStars a.product-reviews-link').attr('title') or
    $('#revFMSR a').attr('title') or
    0
  )
  ratingCount = num(
    $('#acrCustomerReviewText').text() or
    $('#revSAFRLU').text() or
    0
  )

  publisher = if d['Publisher'] then d['Publisher'].replace(/;.*/, '') else d['Sold by']

  pubDateRaw = d['Publication Date'] or d['Publisher'].match(/\((.*)\)/)[1]
  pubDate = moment(pubDateRaw, 'MMMM D, YYYY')
  age = moment.duration(moment().diff(pubDate))

  length = d['Print Length'] or d['Paperback'] or d['Hardcover']
  words = if length then num(length) * 250 else 0
  fileSize = d['File Size']

  if allCategories.length
    catTableButton = $('
      <span class="a-button a-button-small">
        <span class="a-button-inner">
          <span class="a-button-text a-text-center">Expand ▼</span>
        </span>
      </span>
    ')
  else catTableButton = $('
      <span class="a-button a-button-small a-button-disabled">
        <span class="a-button-inner">
          <span class="a-button-text a-text-center">No Additional Categories</span>
        </span>
      </span>
    ')

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
    authorExpander
    if length
      " - Length: #{length} (~#{words.toLocaleString()} words)" + \
      '<sup><abbr title="Number of pages times 250 words per page">?</abbr></sup>'
    if fileSize then " - Size: #{fileSize}"
    ' - '
    'ASIN: ', asin
    '<br/>' # ------------
    authorRank
    'Book Rank: #', rank.toLocaleString()
    ' - '
    'Tier ', tier
    '<sup><abbr title="From Chris Fox\'s &quot;Writing To Market&quot;">?</abbr></sup>'
    ' - '
    "<a href='https://www.novelrank.com/asin/#{ asin }'>NovelRank</a>"
    ' - '
    'Rating: ', ratingAvg
    ' - '
    'Reviews: ', "<a href=#customerReviews>#{ ratingCount.toLocaleString() }</a>"
    ' - '
    'Age: ', "#{ Math.round(age.asWeeks()) } weeks"
    ' - '
    'Ratio: ', Number(ratingCount / age.asWeeks()).toFixed(2)
    '<sup><abbr title="Number of ratings divided by the age in weeks">?</abbr></sup>'
    '<br/>' # ------------
    $('<div class="cat-table"/>').append(
      $('<div class="cat-table-cell"/>').append(categories)
      $('<div class="cat-table-cell"/>').append(catTableButton)
    )
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

  fetchAllCategories = ->
    catTableButton = catTableButton.parent()
    catTableButton.html '''
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
      </div>
    '''

    idToRank = {}
    for li in $(categories).find('li')
      li = $(li)
      rank = num li.find('.zg_hrsr_rank').text()
      crumb = li.find('.zg_hrsr_ladder')
      $(crumb.contents())[0]?.remove()
      id = num li.find('a:last').attr('href')
      #console.log 'XXX', id, rank, crumb.text()
      idToRank[id] = rank

    categories = categories.parent()
    categories
      .empty()
      .css(textAlign: 'left')
      .append(allCategories.clone().addClass('zg_hrsr'))

    next = (fn) -> setTimeout fn, 500

    forEachSeries categories.find('li'), (li, cb) ->
      li = $(li)
      id = Number li.find('a:last').attr('href').match(/node=(\d+)/)?[1]
      console.log "looking up book in category #{id}..."
      if id of idToRank
        console.log "already had rank #{idToRank[id]} in preview."
        li.append(" - ##{ idToRank[id] }")
        return next(cb)

      page = 1
      {host, protocol} = document.location
      fetch = ->
        url =  "#{protocol}//#{host}/Best-Sellers-Books/zgbs/books/#{id}/?_encoding=UTF8&pg=#{page}&ajax=1"
        console.log "fetching url", url
        $.get url, (data) ->
          data = $(data)
          substr = "/#{asin}/"
          el = data.find("a[href*='#{substr}']")
          if el.length
            rank = num el.parents('.zg_itemImmersion').find('.zg_rankDiv').text()
            console.log 'found rank', rank
            li.append(" - ##{ rank }")
            next(cb)
          else if page < 5
            page++
            console.log 'trying page', page
            next(fetch)
          else
            console.log 'asin not found'
            rank = '>100'
            li.append(" - ##{ rank }")
            next(cb)
      fetch()

    , ->
      console.log 'done'
      catTableButton.detach()

  if allCategories.length
    catTableButton.on 'click', fetchAllCategories






