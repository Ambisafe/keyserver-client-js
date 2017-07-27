const crypto = require('crypto')

const axios = require('axios')

const container = require('./container')


class Client {
  constructor(ambisafeServer, secret, apiKey, apiSecret, prefix='', timeout=null) {
    this.server = ambisafeServer
    this.secret = secret
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    this.prefix = prefix
    this.timeout = timeout
  }

  getHeaders(method, url, data) {
    method = method.toLowerCase()
    let headers = {
      'Accept': 'application/json',
    }
    if (this.timeout) {
      headers.timeout = this.timeout
    }
    if (['post', 'put'].includes(method)) {
      headers['Content-Type'] = 'application/json'
    }
    let {nonce, signature} = this.getAuth(method, url, data)
    headers.Timestamp = nonce
    headers.Signature = signature
    headers['API-key'] = this.apiKey
    return headers
  }

  getPrefixedAccount(accountId) {
    return `${this.prefix}${accountId}`
  }

  createUserSideKeyAccount(accountId, userContainer, currency='BTC') {
    let containers = {
      USER: userContainer.asRequest()
    }
    let data = {
      id: this.getPrefixedAccount(accountId),
      currency,
      security_schema: 'UserSideKey',
      containers
    }
    return this.makeRequest('POST', '/accounts', data)
      .then(this._handleResponse)
  }

  getAuth(method, url, body) {
    let nonce = +new Date()
    let msg = `${nonce}\n${method.toUpperCase()}\n${url}\n${body}`
    let signature = crypto.createHmac('sha512', this.apiSecret).update(msg).digest('base64')
    return {
      nonce,
      signature: signature.replace('\n', '')
    }
  }

  makeRequest(method, uri, data) {
    let json = typeof data == 'string' ? data : JSON.stringify(data)
    let url = `${this.server}${uri}`
    return axios({
      method,
      url,
      data: json,
      headers: this.getHeaders(method, url, json)
    })
    .then(this._handleResponse)
  }

  _handleResponse(response) {
    return response
  }
}


exports.Client = Client


