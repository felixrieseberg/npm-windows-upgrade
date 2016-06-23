function debug (message) {
  if (process.env.DEBUG) {
    console.log(message)
  }
}

module.exports = debug
