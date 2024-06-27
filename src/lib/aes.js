import CryptoJS from "crypto-js"

const strPermutation = process.env.REACT_APP_AES_KEY

// 암호화
export const encryptAes = (text) => {
  const key = CryptoJS.enc.Utf8.parse(strPermutation)

  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv: key,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  })

  return encrypted.toString()
}

// 복호화
export const decryptAes = (encryptedText) => {
  const key = CryptoJS.enc.Utf8.parse(strPermutation)

  const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
    iv: key,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  })

  return decrypted.toString(CryptoJS.enc.Utf8)
}
