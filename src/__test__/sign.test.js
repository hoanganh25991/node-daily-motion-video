import { encrypt, decrypt } from "../sign"

const data = {
  // url: "https://example.com",
  url: "https://tinker.press/videos/say-hello-to-cozmo.mp4",
}

const token = encrypt(JSON.stringify(data))
console.log("[token]", token)
const decode = decrypt(token)
console.log("[decode]", decode)
