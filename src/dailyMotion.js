import Oaxios from "axios"

const ALLOW_TIMEOUT = 120 * 60 * 1000 // 120m = 2h

const axios = Oaxios.create({
  timeout: ALLOW_TIMEOUT,
  validateStatus: status => status !== 500
})

const CancelToken = Oaxios.CancelToken;

const _ = console.log
const ACCEPT_VIDEO_FORMAT = "video/mp4"
const ACCEPT_QUALITY = 480

export const fetchHtml = async url => {
  try{
    const res = await axios.get(url)
    const html = res.data
    // _("[fetchHtml][html]", html)
    return html
  }catch(err){
    _("[fetchHtml][ERR]", err.message)
    return null
  }
}

export const getMetaDataQualitiesStr = html => {
  try{
    _("[getMetaDataQualitiesStr][html]", html.length)
    const metaQualitiesPattern = /"qualities":(.*?}),"/;
    const matches = html.match(metaQualitiesPattern)
    const qualitiesStr = matches[1]
    return qualitiesStr
  }catch(err){
    _("[getMetaDataQualitiesStr][ERR]", err.message)
    return null
  }
}


export const getQualitiesMp4Url = qualities => {
  return Object.keys(qualities).reduce((carry, key) => {
    const isAcceptedQuality = +key >= ACCEPT_QUALITY
    if(!isAcceptedQuality) return carry

    const videos = qualities[key]
    const firstMp4Video = videos.filter(video => video.type === ACCEPT_VIDEO_FORMAT)[0]
    if(!firstMp4Video) return carry

    const {url } = firstMp4Video
    carry[key] = url
    return carry
  }, {})
}


export const getFinalRedirectUrl = async url => {
  const source = CancelToken.source();

  try{
    const streamOpt = { url, method: "get", responseType: "stream", cancelToken: source.token}
    const finalUrl = await axios(streamOpt)
      .then(res => {
        // const now = new Date().getTime()
        const finalUrl = res.request.res.responseUrl
        // _("[chunk,now]", finalUrl, now)
        source.cancel("Ok, just get redirect url, dont fetch it")
        return finalUrl
      })
      .catch(err => {
        _("[getFinalRedirectUrl][ERR]", err)
        return null
      })

    // const now = new Date().getTime()
    // _("[finalUrl, now]", finalUrl, now)
    return finalUrl
  }catch(err){
    _("[getFinalRedirectUrl][ERR]", err.message)
    return null
  }
}

export const getVideoUrl = async dailyVideoUrl => {
  try{
    const html = await fetchHtml(dailyVideoUrl)
    const qualitiesStr = getMetaDataQualitiesStr(html)
    const qualities = JSON.parse(qualitiesStr)
    _("[qualities]", qualities)

    const urls = getQualitiesMp4Url(qualities)
    _("[urls]", urls)

    const finalUrls = {}

    const waitList = Object.keys(urls).map(async key => {
      const url = urls[key]
      const finalUrl = await getFinalRedirectUrl(url)
      finalUrls[key] = finalUrl
    })

    await Promise.all(waitList)

    _("[finalUrls]", finalUrls)

    return qualities
  }catch(err){
    _("[getVideoUrl][ERR]", err.message)
    return null
  }
}

