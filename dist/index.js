
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./react-use-watchlist.cjs.production.min.js')
} else {
  module.exports = require('./react-use-watchlist.cjs.development.js')
}
