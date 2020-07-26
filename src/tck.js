// Generated by CoffeeScript 1.12.2
var $;

$ = jQuery.noConflict();

$(function() {
  var hash, isEbook, rank, ref;
  hash = document.location.hash;
  if (!/,/.test(hash)) {
    return;
  }
  ref = hash.substr(1).split(','), rank = ref[0], isEbook = ref[1];
  isEbook = Boolean(Number(isEbook));
  $('#brpbsr-bsr').val(rank);
  if (isEbook) {
    $('#brpbsr-type option[value="ebook"]').prop('selected', true);
  } else {
    $('#brpbsr-type option[value="book"]').prop('selected', true);
  }
  $('#cf-submitted').click();
  return $('html, body').animate({
    scrollTop: $('#brpbsr-form').offset().top
  }, 0);
});
