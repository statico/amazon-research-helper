$ ->

  if not /Amazon Best Sellers Rank/.test $('body').text()
    return

  details = {}
  $('#productDetailsTable li').each ->
    key = $(this).find('b').text().replace(/:$/, '').trim()
    el = $(this).clone()
    el.find('b').remove()
    val = el.text().trim()
    details[key] = val
  console.dir 'XXX', details

  info = $('<div/>')
  info.css(
    background: '#C7D8EE'
    textAlign: 'center'
    padding: '10px'
  )
  info.sticky(topSpacing: 0)
  info.appendTo 'header'
  info.append [
    "<b>#{ $('#title').text() }</b>",
    '<br/>'
    'Author: ', $('.author .contributorNameID').clone().attr(target: '_blank')
    ' - '
    'Publisher: ', (if /Amazon Digital Services LLC/.test(details.Publisher) then '<b>Self-Published</b>' else details.Publisher)
  ]

