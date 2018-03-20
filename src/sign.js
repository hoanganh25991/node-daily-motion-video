import crypto from "crypto"
import dotenv from "dotenv"

dotenv.config()
const { SECRET, ALGORITHM } = process.env
const hasConf = SECRET && ALGORITHM

if (!hasConf) {
  console.log(`Fail to setup ${__filename} conf`)
  process.exit()
}

export const encrypt = text => {
  try {
    const cipher = crypto.createCipher(ALGORITHM, SECRET)
    let crypted = cipher.update(text, "utf8", "hex")
    crypted += cipher.final("hex")
    return crypted
  } catch (err) {
    return null
  }
}

export const decrypt = text => {
  try {
    const decipher = crypto.createDecipher(ALGORITHM, SECRET)
    let dec = decipher.update(text, "hex", "utf8")
    dec += decipher.final("utf8")
    return dec
  } catch (err) {
    return null
  }
}
