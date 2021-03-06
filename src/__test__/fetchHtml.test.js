import { fetchHtml } from "../dailyMotion"

const _ = console.log
const infoTestStatus = (pass, testCase) =>
  pass ? _(`\x1b[42m[PASS]\x1b[0m ${testCase}`) : _(`\x1b[41m[FAIL]\x1b[0m ${testCase}`)

// Run test
;(async () => {
  const TEST_CASE = "Fetch daily motion page"
  const dailyUrl = "https://www.dailymotion.com/video/x6gfvbd"
  let pass = true

  try {
    const html = await fetchHtml(dailyUrl)
    pass = html && html.length > 0
  } catch (err) {
    _(`[${TEST_CASE}][ERR]`, err.message)
    pass = false
  } finally {
    infoTestStatus(pass, TEST_CASE)
  }
})()
