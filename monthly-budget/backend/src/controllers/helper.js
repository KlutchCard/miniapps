const { sign } = require('jsonwebtoken');
const { recipeId, timeoutSec, privateKey, klutchPublicKey } = require('../config/config')
const   { GraphQLService, RecipesService } = require("@klutch-card/klutch-js")

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

const auth = async (recipeInstallId) => {
  try {
      const recipeKey = BuildJWTToken()
      GraphQLService.setAuthToken(recipeKey)
      const recipeInstallJWT = await RecipesService.getRecipeInstallToken(recipeInstallId)
      GraphQLService.setAuthToken(recipeInstallJWT)    
      return recipeInstallJWT
  } catch (e) {
      console.error(e)
      throw e
  }
}


module.exports = { BuildJWTToken, auth }
