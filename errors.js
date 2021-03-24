exports.ValidationError = class extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
};

exports.RequestParamError = class extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
};
