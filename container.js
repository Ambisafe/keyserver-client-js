const btc = require('bitcoinjs-lib')
const uuid = require('uuid/v4')

const crypto = require('./crypto')


class Container {
  constructor(pubKey, data, iv, salt) {
    this.publicKey = pubKey
    this.data = data
    this.iv = iv
    this.salt = salt
  }

  asRequest() {
    return {
      publicKey: this.publicKey,
      public_key: this.publicKey,  // workaround
      data: this.data,
      iv: this.iv,
      salt: this.salt,
    }
  }
}

function generateKeyPair() {
  let keyPair = btc.ECPair.makeRandom()
  return {
    address: keyPair.getAddress(),
    pubKey: keyPair.getPublicKeyBuffer().toString('hex'),
    privKey: keyPair.toWIF()
  }
}

function generate(secret) {
  let {pubKey, privKey} = generateKeyPair()
  let {encryptedPrivKey, iv, salt} = _encrypt(privKey, secret)
  return new Container(pubKey, encryptedPrivKey, iv, salt)
}

function _encrypt(data, secret) {
  let salt = uuid()
  let {iv, data: encryptedPrivKey} = crypto.encrypt(secret, data, salt)
  return {
    encryptedPrivKey,
    iv,
    salt
  }

}

module.exports.Container = Container
module.exports.generateKeyPair = generateKeyPair
module.exports.generate = generate