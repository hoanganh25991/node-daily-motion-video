import Oaxios from "axios"

const ALLOW_TIMEOUT = 120 * 60 * 1000 // 120m = 2h

const axios = Oaxios.create({
  timeout: ALLOW_TIMEOUT,
  validateStatus: status => status !== 500
})

const _ = console.log

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

export const getVideoUrl = async dailyVideoUrl => {
  try{
    const html = await fetchHtml(dailyVideoUrl)
    const qualitiesStr = getMetaDataQualitiesStr(html)
    const qualities = JSON.parse(qualitiesStr)

    // _("[qualities]", qualities)
    return qualities
  }catch(err){
    _("[getVideoUrl][ERR]", err.message)
    return null
  }
}