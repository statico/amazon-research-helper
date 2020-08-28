const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const main = () => {
  const { hash } = document.location
  if (!/,/.test(hash)) {
    return
  }
  let [asin, tld] = Array.from(hash.substr(1).split(','))
  document.location.hash = '#'

  $('#asin').value = asin

  if (tld == 'com') {
    $('#storename').children[0].selected = true
  } else if (tld == 'ca') {
    $('#storename').children[1].selected = true
  } else if (tld == 'uk') {
    $('#storename').children[2].selected = true
  }

  $('#booklink5_submit').click()
}

try {
  main()
} catch (err) {
  console.error(
    '%camazon-research-helper error',
    'font-size: 24px; font-weight: bold'
  )
  console.error(err)
}
