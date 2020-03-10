const jwt = require('jsonwebtoken')
const config = require("../config");

const createToken = (payload = {}) => {
  return jwt.sign(payload, config.privateKey, { algorithm: 'HS256' })
}

const validateToken = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.privateKey, (err, payload) => {
      if (err) reject(err)
      else resolve(payload)
    })
  })
}

module.exports = {
    createToken,
    validateToken
};
