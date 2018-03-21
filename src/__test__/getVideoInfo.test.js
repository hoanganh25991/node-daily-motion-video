import { getVideoInfo } from "../dailyMotion"

const _ = console.log
const infoTestStatus = (pass, testCase) =>
  pass ? _(`\x1b[42m[PASS]\x1b[0m ${testCase}`) : _(`\x1b[41m[FAIL]\x1b[0m ${testCase}`)

// Run test
;(async () => {
  const TEST_CASE = "Get final url with video info"
  const dailyUrl = "https://tinker.press/redirect.php"
  let pass = true

  try {
    const { url } = await getVideoInfo({ quality: 720, url: dailyUrl })
    pass = url && url === "https://tinker.press/videos/def.mp4"
  } catch (err) {
    _(`[${TEST_CASE}][ERR]`, err.message)
    pass = false
  } finally {
    infoTestStatus(pass, TEST_CASE)
  }
})()
