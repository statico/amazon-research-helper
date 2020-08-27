const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const main = () => {
  const { hash } = document.location
  if (!/,/.test(hash)) {
    return
  }
  let [rank, isEbook] = Array.from(hash.substr(1).split(','))
  isEbook = Boolean(Number(isEbook))

  $('#rank-input').value = rank

  if (isEbook) {
    $('#change').children[0].click()
  } else {
    $('#change').children[1].click()
  }

  $('#press').click()

  window.addEventListener('load', () => {
    setTimeout(() => {
      $('#mainbg').scrollIntoView()
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
