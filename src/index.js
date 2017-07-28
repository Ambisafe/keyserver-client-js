const crypto = require('./crypto')

const axios = require('axios')

const Account = require('./account').Account
const container = require('./container')
const {Container} = container


class Client {
  constructor(ambisafeServer, secret, apiKey, apiSecret, prefix='', timeout=null) {
    this.server = ambisafeServer
    this.secret = secret
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    this.prefix = prefix
    this.timeout = timeout
  }

  getContainer(accountId, currency='BTC') {
    return this.getAccount(accountId, currency)
      .then(data => this._normalizeContainer(data.data.containers))
  }

  getContainerByAddress(address) {
    return this.getAccountByAddress(address)
      .then(data => this._normalizeContainer(data.data.containers))
  }

  getAccount(accountId, currency='BTC') {
    return this._makeRequest('GET', `/accounts/${this._getPrefixedAccount(accountId)}/${currency}`)
      .then(res => Account.fromServerResponse(res.data))
  }

  getAccountByAddress(address) {
    return this._makeRequest('GET', `/account/${address}`)
      .then(res => Account.fromServerResponse(res.data))
  }

  getBalance(accountId, currency='BTC') {
    return this._makeRequest('GET', `/balances/${currency}/${this._getPrefixedAccount(accountId)}`)
      .then(res => this._normalizeBalance(res.data))
  }

  getBalanceByAddress(address, currency='BTC') {
    return this._makeRequest('GET', `/balances/${currency}/address/${address}`)
      .then(res => this._normalizeBalance(res.data))
  }

  submit(accountId, tx, currency='BTC') {
    let url = `/transactions/submit/${this._getPrefixedAccount(accountId)}/${currency}`
    return this._makeRequest('POST', url, tx.toJSON())
  }

  createUserSideKeyAccount(accountId, userContainer, currency='BTC') {
    let containers = {
      USER: userContainer.asRequest()
    }
    let data = {
      id: this._getPrefixedAccount(accountId),
      currency,
      security_schema: 'UserSideKey',
      containers
    }
    return this._makeRequest('POST', '/accounts', data)
  }

  buildTransaction(accountId, destination, amount, currency='BTC') {
    let body = {
      destination,
      amount,
    }
    let externalId = this._getPrefixedAccount(accountId)
    return this._makeRequest('POST', `/transactions/build/${externalId}/${currency}`, JSON.stringify(body))
  }

  _makeRequest(method, uri, data=null) {
    let json
    if (data == null) {
      json = ''
    }
    else if (typeof data == 'string') {
      json = data
    } else {
      json = JSON.stringify(data)
    }
    let url = `${this.server}${uri}`
    return axios({
      method,
      url,
      data: json,
      headers: this._getHeaders(method, url, json)
    })
  }

  _normalizeBalance(balance) {
    if (balance.currencySymbol != 'BTC') {
      throw `${balance.currencySymbol} is not supported`
    }
    const fields = ['balanceInSatoshis', 'balance', 'confirmedBalance']
    return fields.reduce((obj, field) => Object.assign({}, obj, {[field] : this._unhexify(balance[field])}), {})
  }

  _unhexify(number) {
    if (number.startsWith('0x')) {
      return parseInt(balance, 16)
    }
    return number
  }

  _normalizeContainer(container) {
    return Container.fromObject(container.USER)
  }

  _getHeaders(method, url, data) {
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
    let {nonce, signature} = this._getAuth(method, url, data)
    headers.Timestamp = nonce
    headers.Signature = signature
    headers['API-key'] = this.apiKey
    return headers
  }

  _getPrefixedAccount(accountId) {
    return `${this.prefix}${accountId}`
  }

  _getAuth(method, url, body) {
    let nonce = +new Date()
    let msg = `${nonce}\n${method.toUpperCase()}\n${url}\n${body || ''}`
    let signature = crypto.createHmac('sha512', this.apiSecret).update(msg).digest('base64')
    return {
      nonce,
      signature: signature.replace('\n', '')
    }
  }
}


module.exports = Client
