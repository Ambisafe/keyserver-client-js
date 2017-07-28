class BaseTransaction {
  constructor(hex, fee, sighashes) {
    this.hex = hex
    this.fee = fee
    this.sighashes = sighashes
  }

  toJSON() {
    let {hex, fee, sighashes} = this
    return {hex, fee, sighashes}
  }
}


class UserSideTransaction extends BaseTransaction {
  constructor(hex, fee, sighashes, userSignatures) {
    super(hex, fee, sighashes)
    this.userSignatures = userSignatures
  }

  toJSON() {
    return Object.assign({}, super.toJSON(), {
      user_signatures: this.userSignatures
    })
  }
}


exports.BaseTransaction = BaseTransaction
exports.UserSideTransaction = UserSideTransaction