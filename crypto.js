const crypto = require('crypto')

const aes = require('aes-js')


const BLOCK_SIZE = 16
const KEY_LENGTH = 32
const ITERATIONS = 1000


function pad(string) {
  let padLen = BLOCK_SIZE - (string.length % BLOCK_SIZE)
  if (padLen == 0) {
    padLen = BLOCK_SIZE
  }
  let padded = string
  for (let i = 0; i < padLen; i++) {
    padded += String.fromCharCode(padLen)
  }
  return padded
}


function unpad(string) {
  let padLen = string.charCodeAt(string.length - 1)
  return string.slice(0, -padLen)
}


function generateIV(length=BLOCK_SIZE) {
  return crypto.randomBytes(length)
}


function encrypt(password, data, salt) {
  let key = _deriveKey(salt, password)
  let iv = generateIV()
  let aesCbc = new aes.ModeOfOperation.cbc(key, iv)
  let dataAsBytes = aes.utils.utf8.toBytes(pad(data))
  let encryptedBytes = aesCbc.encrypt(dataAsBytes)
  return {
    iv: aes.utils.hex.fromBytes(iv),
    data: aes.utils.hex.fromBytes(encryptedBytes)
  }
}


function decrypt(password, data, salt, iv) {
  let key = _deriveKey(salt, password)
  let ivAsBytes = typeof iv == 'string' ? aes.utils.utf8.fromBytes(iv) : iv
  let aesCbc = new aes.ModeOfOperation.cbc(key, ivAsBytes)
  let dataAsBytes = aes.utils.hex.toBytes(data)
  let decryptedBytes = aesCbc.decrypt(dataAsBytes)
  return unpad(aes.utils.utf8.fromBytes(decryptedBytes))
}


function _deriveKey(salt, password, iterations=ITERATIONS, keyLen=KEY_LENGTH) {
  return crypto.pbkdf2Sync(password, salt, iterations, keyLen, 'sha512')
}

exports.encrypt = encrypt
exports.decrypt = decrypt