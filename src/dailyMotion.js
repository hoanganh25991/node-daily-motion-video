import Oaxios from "axios"

const ALLOW_TIMEOUT = 6000 //6s
const axios = Oaxios.create({
  timeout: ALLOW_TIMEOUT,
  validateStatus: status => status !== 500
})
const _ = console.log
const ACCEPT_QUALITY = 480
const ACCEPT_VIDEO_FORMAT = "video/mp4"
const CancelToken = Oaxios.CancelToken

/**
 * Fetch Daily motion page
 * @param url
 * @return {Promise.<null>}
 */
export const fetchHtml = async url => {
  try {
    const res = await axios.get(url)
    const html = res.data
    // _("[fetchHtml][html]", html)
    return html
  } catch (err) {
    _("[fetchHtml][ERR]", err.message)
    return null
  }
}

/**
 * Extract qualities info from html page
 * @param html
 * @return string|null
 */
export const getMetaDataQualitiesStr = html => {
  try {
    const metaQualitiesPattern = /"qualities":(.*?}),"/
    const matches = html.match(metaQualitiesPattern)
    const qualitiesStr = matches[1]
    return qualitiesStr
  } catch (err) {
    _("[getMetaDataQualitiesStr][ERR]", err.message)
    return null
  }
}

/**
 * Get mp4 url
 * @param qualities
 * @return {*}
 */
export const getQualitiesMp4Url = qualities => {
  return Object.keys(qualities).reduce((carry, key) => {
    const isAcceptedQuality = +key >= ACCEPT_QUALITY
    if (!isAcceptedQuality) return carry

    const videos = qualities[key]
    const firstMp4Video = videos.filter(video => video.type === ACCEPT_VIDEO_FORMAT)[0]
    if (!firstMp4Video) return carry

    const { url } = firstMp4Video
    carry[key] = url
    return carry
  }, {})
}

/**
 * Follow redirect to get final download url
 * @param quality
 * @param url
 * @return {Promise.<*>}
 */
export const getVideoInfo = async ({ quality, url }) => {
  const source = CancelToken.source()

  try {
    const streamOpt = { url, method: "get", responseType: "stream", cancelToken: source.token }
    const videoInfo = await axios(streamOpt)
      .then(res => {
        const finalUrl = res.request.res.responseUrl
        const size = res.request.res.headers["content-length"]
        const sizeInMB = size && (+size / 1000000).toFixed(2)
        const sizeWithMB = size && `${sizeInMB}MB`
        source.cancel("Ok, just get redirect url, dont fetch it")
        return {
          ext: "MP4",
          size: sizeWithMB,
          url: finalUrl,
          quality
        }
      })
      .catch(err => {
        _("[getVideoInfo][ERR]", err)
        return null
      })

    return videoInfo
  } catch (err) {
    _("[getVideoInfo][ERR]", err.message)
    return null
  }
}

/**
 * Get real Daily motion download video from Daily motion link
 * @param dailyVideoUrl
 * @return {Promise.<Array>}
 */
export const getVideoInfos = async dailyVideoUrl => {
  try {
    const html = await fetchHtml(dailyVideoUrl)
    const qualitiesStr = getMetaDataQualitiesStr(html)
    const qualities = JSON.parse(qualitiesStr)
    const urls = getQualitiesMp4Url(qualities)
    const videoInfos = {}
    const waitList = Object.keys(urls).map(async quality => {
      const url = urls[quality]
      const videoInfo = await getVideoInfo({ quality, url })
      videoInfos[quality] = videoInfo
    })

    await Promise.all(waitList)
    return Object.values(videoInfos)
  } catch (err) {
    _("[getVideoInfos][ERR]", err.message)
    return null
  }
}
