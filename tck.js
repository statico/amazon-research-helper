const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const main = () => {
  const { hash } = document.location
  if (!/,/.test(hash)) {
    return
  }
  let [rank, isEbook] = Array.from(hash.substr(1).split(','))
  isEbook = Boolean(Number(isEbook))

  $('#brpbsr-bsr').value = rank

  if (isEbook) {
    $('#brpbsr-type').children[0].selected = true
  } else {
    $('#brpbsr-type').children[1].selected = true
  }

  $('#cf-submitted').click()

  window.addEventListener('load', () => {
    setTimeout(() => {
      $('#brpbsr-form').scrollIntoView()
    }, 500)
  })
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
