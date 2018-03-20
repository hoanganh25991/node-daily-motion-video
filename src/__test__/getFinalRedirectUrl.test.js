import {getFinalRedirectUrl} from "../dailyMotion";

(async () => {
  const testUrl = "https://tinker.press/redirect.php"
  await getFinalRedirectUrl(testUrl)
})()