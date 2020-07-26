var $ = jQuery.noConflict()

var hash, isEbook, rank, ref

hash = document.location.hash
if (!/,/.test(hash)) {
  return
}

;(ref = hash.substr(1).split(',')), (rank = ref[0]), (isEbook = ref[1])
isEbook = Boolean(Number(isEbook))

$('#rank-input').val(rank)
if (isEbook) {
  $('#view-kindle .toggle-btn:eq(0)').click()
} else {
  $('#view-kindle .toggle-btn:eq(1)').click()
}

$('#press').click()

return $('html, body').animate(
  {
    scrollTop: $('#mainbg .screen').offset().top
  },
  0
)
