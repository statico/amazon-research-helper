/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const $ = jQuery.noConflict()

$(function () {
  const { hash } = document.location
  if (!/,/.test(hash)) {
    return
  }
  let [rank, isEbook] = Array.from(hash.substr(1).split(','))
  isEbook = Boolean(Number(isEbook))

  $('#rank-input').val(rank)

  if (isEbook) {
    $('#view-kindle .toggle-btn:eq(0)').click()
  } else {
    $('#view-kindle .toggle-btn:eq(1)').click()
  }

  $('#press').click()

  return $('html, body').animate({ scrollTop: $('#mainbg .screen').offset().top }, 0)
})
