const Container = require('./container').Container


const Account = class {
  constructor(id, externalId, schema, address, container) {
    this.id = id
    this.externalId = externalId
    this.schema = schema
    this.address = address
    this.container = container
  }
}

Account.fromServerResponse = serverResponse => {
  let {account} = serverResponse
  if (account.securitySchemaName != 'UserSideKey') {
    console.warn(`Only UserSideKey schema is supported while received ${account.securitySchemaName} schema`)
  }
  return new Account(
    account.id,
    account.externalId,
    account.securitySchemaName,
    account.address,
    Container.fromObject(serverResponse.containers.USER)
  )
}


module.exports.Account = Account