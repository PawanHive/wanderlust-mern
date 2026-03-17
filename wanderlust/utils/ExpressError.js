// custom Express Error

// The job of this ExpressError class is:
//To create structured, custom errors that carry both a message AND an HTTP status code.

class ExpressError extends Error {
  constructor (statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

module.exports = ExpressError;