const { sign, verify } = require('jsonwebtoken');
const { recipeId, timeoutSec, privateKey, klutchPublicKey } = require('../config/config')

const BuildJWTToken = () => {
  const header = { algorithm: "RS256", keyid: `AlloyPrincipal-${recipeId}` }
  const payload = {
    exp: Math.floor(Date.now() / 1000) + timeoutSec,
    iat: Math.floor(Date.now() / 1000),
    iss: "AlloyCard",
    "custom:principalId": recipeId,
    "custom:principalType": "com.alloycard.core.entities.recipe.Recipe"
  }

  return sign(payload, privateKey, header)
}

const DecodeToken = (jwtToken) => verify(jwtToken, klutchPublicKey, { algorithms: ["RS256"] })

module.exports = { BuildJWTToken, DecodeToken }
