import ffmpeg from "fluent-ffmpeg"

const handleErr = err => {
  console.log("[convertStreamToMp3][ERR]", err)
}

const printCmd = cmd => {
  console.log("Spawned Ffmpeg with command: " + cmd)
}

export const convertStreamToMp3 = videoStream => {
  return ffmpeg(videoStream)
    .on("start", printCmd)
    .on("error", handleErr)
    .format("mp3")
    .outputOptions("-ab 320k")
    .pipe()
}
