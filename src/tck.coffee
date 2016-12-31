$ = jQuery.noConflict()

$ ->

  {hash} = document.location
  return unless /,/.test hash
  [rank, isEbook] = hash.substr(1).split ','
  isEbook = Boolean Number isEbook

  $('#brpbsr-bsr').val rank

  if isEbook
    $('#brpbsr-type option[value="ebook"]').prop 'selected', true
  else
    $('#brpbsr-type option[value="book"]').prop 'selected', true

  $('#cf-submitted').click()

  $('html, body').animate({ scrollTop: $('#brpbsr-form').offset().top }, 0);


