import http from "http"
import { getVideoStream } from "./getVideoStream"
import { convertStreamToMp3 } from "./convert"
import { msg } from "./message"
import URL from "url"
import { decrypt } from "./sign"

const getUrl = req => {
  const { query = {} } = URL.parse(req.url, true)
  const { token } = query
  const dataStr = decrypt(token)

  try {
    const { url } = JSON.parse(dataStr)
    return url
  } catch (err) {
    return null
  }
}

const setDownloadHeader = res => {
  const timestamp = new Date().getTime()
  res.setHeader("Content-disposition", `attachment; filename=${timestamp}.mp3`)
  res.setHeader("Content-type", "application/octet-stream")
}

const run = () => {
  const { SERVER_PORT } = process.env
  const port = SERVER_PORT || 3000

  http
    .createServer(async (req, res) => {
      const url = getUrl(req)
      if (!url) return res.end(msg.GET_URL_FAIL)

      const videoStream = await getVideoStream(url)
      if (!videoStream) return res.end(msg.GET_VIDEO_FAIL)

      setDownloadHeader(res)
      const convertStream = convertStreamToMp3(videoStream)
      convertStream.on("data", chunk => res.write(chunk))
      convertStream.on("finish", () => res.end())
    })
    .listen(port)
}

run()
