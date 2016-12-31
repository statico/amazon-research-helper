$ = jQuery.noConflict()

$ ->

  {hash} = document.location
  return unless /,/.test hash
  [rank, isEbook] = hash.substr(1).split ','
  isEbook = Boolean Number isEbook

  $('#rank-input').val rank

  if isEbook
    $('#view-kindle .toggle-btn:eq(0)').click()
  else
    $('#view-kindle .toggle-btn:eq(1)').click()

  $('#press').click()

  $('html, body').animate({ scrollTop: $('#mainbg .screen').offset().top }, 0);


