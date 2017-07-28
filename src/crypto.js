const crypto = require('src/crypto')

const BigInteger = require('bigi')

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
  let aes = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = aes.update(pad(data), 'utf8', 'hex')
  encrypted += aes.final('hex')
  return {
    iv: iv.toString('hex'),
    data: encrypted,
  }
}


function decrypt(password, data, salt, iv) {
  let key = _deriveKey(salt, password)
  let ivAsBytes = typeof iv == 'string' ? Buffer.from(iv, 'hex') : iv
  let aes = crypto.createDecipheriv('aes-256-cbc', key, ivAsBytes)
  let decrypted = aes.update(data, 'hex', 'utf8')
  decrypted += aes.final('utf8')
  return unpad(decrypted)
}


function sign(sighash, privKey) {
  let buffer = typeof privKey == 'string' ? new Buffer(privKey, 'hex') : privKey
  let sighashBuf = typeof sighash == 'string' ? new Buffer(sighash, 'hex') : sighash
  let d = BigInteger.fromBuffer(buffer)
  let keyPair = new btc.ECPair(d, true)
  return keyPair.sign(sighashBuf).toDER().toString('hex')
}


function _deriveKey(salt, password, iterations=ITERATIONS, keyLen=KEY_LENGTH) {
  return crypto.pbkdf2Sync(password, salt, iterations, keyLen, 'sha512')
}


exports.encrypt = encrypt
exports.decrypt = decrypt
exports.sign = sign