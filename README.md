# Ambisafe Keyserver JS Client

## Attention

Library only supports UserSideKeyAccount schema and BTC for now

## Example

```js
const container = require('keyserver-client/container')
const Client = require('keyserver-client')
const {Account} = require('keyserver-client/account')

// init client
let client = new Client('ambiServerUrl', 'ambiSecret', 'apiKey', 'apiSecret', 'UNIQUE_PREFIX')

// generate new container
let cont = container.generate('secret')

let accountId = 47
client.createUserSideKeyAccount(accountId, cont)  // store container
.then(() => client.getAccount(accountId))  // get account from server
.then(account => {
  let amountInBtc = 0.1
  client.buildTransaction(accountId, '', amountInBtc)  // build tx
  .then(tx => account.signTransaction('secret', tx))  // sign tx
  .then(tx => client.submit(accountId, tx)) // submit signed tx
  .then(console.log)
})
```