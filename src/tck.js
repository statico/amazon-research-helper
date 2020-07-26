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

  $('#brpbsr-bsr').val(rank)

  if (isEbook) {
    $('#brpbsr-type option[value="ebook"]').prop('selected', true)
  } else {
    $('#brpbsr-type option[value="book"]').prop('selected', true)
  }

  $('#cf-submitted').click()

  return $('html, body').animate({ scrollTop: $('#brpbsr-form').offset().top }, 0)
})
