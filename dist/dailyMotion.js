"use strict"

Object.defineProperty(exports, "__esModule", {
  value: true
})
exports.getVideoInfos = exports.getVideoInfo = exports.getQualitiesMp4Url = exports.getMetaDataQualitiesStr = exports.fetchHtml = undefined

var _axios = require("axios")

var _axios2 = _interopRequireDefault(_axios)

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

function _asyncToGenerator(fn) {
  return function() {
    var gen = fn.apply(this, arguments)
    return new Promise(function(resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg)
          var value = info.value
        } catch (error) {
          reject(error)
          return
        }
        if (info.done) {
          resolve(value)
        } else {
          return Promise.resolve(value).then(
            function(value) {
              step("next", value)
            },
            function(err) {
              step("throw", err)
            }
          )
        }
      }
      return step("next")
    })
  }
}

const ALLOW_TIMEOUT = 6000 //6s
const axios = _axios2.default.create({
  timeout: ALLOW_TIMEOUT,
  validateStatus: status => status !== 500
})
const _ = console.log
const ACCEPT_QUALITY = 480
const ACCEPT_VIDEO_FORMAT = "video/mp4"
const CancelToken = _axios2.default.CancelToken

/**
 * Fetch Daily motion page
 * @param url
 * @return {Promise.<null>}
 */
const fetchHtml = (exports.fetchHtml = (() => {
  var _ref = _asyncToGenerator(function*(url) {
    try {
      const res = yield axios.get(url)
      const html = res.data
      // _("[fetchHtml][html]", html)
      return html
    } catch (err) {
      _("[fetchHtml][ERR]", err.message)
      return null
    }
  })

  return function fetchHtml(_x) {
    return _ref.apply(this, arguments)
  }
})())

/**
 * Extract qualities info from html page
 * @param html
 * @return string|null
 */
const getMetaDataQualitiesStr = (exports.getMetaDataQualitiesStr = html => {
  try {
    const metaQualitiesPattern = /"qualities":(.*?}),"/
    const matches = html.match(metaQualitiesPattern)
    const qualitiesStr = matches[1]
    return qualitiesStr
  } catch (err) {
    _("[getMetaDataQualitiesStr][ERR]", err.message)
    return null
  }
})

/**
 * Get mp4 url
 * @param qualities
 * @return {*}
 */
const getQualitiesMp4Url = (exports.getQualitiesMp4Url = qualities => {
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
})

/**
 * Follow redirect to get final download url
 * @param quality
 * @param url
 * @return {Promise.<*>}
 */
const getVideoInfo = (exports.getVideoInfo = (() => {
  var _ref2 = _asyncToGenerator(function*({ quality, url }) {
    const source = CancelToken.source()

    try {
      const streamOpt = { url, method: "get", responseType: "stream", cancelToken: source.token }
      const videoInfo = yield axios(streamOpt)
        .then(function(res) {
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
        .catch(function(err) {
          _("[getVideoInfo][ERR]", err)
          return null
        })

      return videoInfo
    } catch (err) {
      _("[getVideoInfo][ERR]", err.message)
      return null
    }
  })

  return function getVideoInfo(_x2) {
    return _ref2.apply(this, arguments)
  }
})())

/**
 * Get real Daily motion download video from Daily motion link
 * @param dailyVideoUrl
 * @return {Promise.<Array>}
 */
const getVideoInfos = (exports.getVideoInfos = (() => {
  var _ref3 = _asyncToGenerator(function*(dailyVideoUrl) {
    try {
      const html = yield fetchHtml(dailyVideoUrl)
      const qualitiesStr = getMetaDataQualitiesStr(html)
      const qualities = JSON.parse(qualitiesStr)
      const urls = getQualitiesMp4Url(qualities)
      const videoInfos = {}
      const waitList = Object.keys(urls).map(
        (() => {
          var _ref4 = _asyncToGenerator(function*(quality) {
            const url = urls[quality]
            const videoInfo = yield getVideoInfo({ quality, url })
            videoInfos[quality] = videoInfo
          })

          return function(_x4) {
            return _ref4.apply(this, arguments)
          }
        })()
      )

      yield Promise.all(waitList)
      return Object.values(videoInfos)
    } catch (err) {
      _("[getVideoInfos][ERR]", err.message)
      return null
    }
  })

  return function getVideoInfos(_x3) {
    return _ref3.apply(this, arguments)
  }
})())
