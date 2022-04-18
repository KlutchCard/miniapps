const { BuildJWTToken, DecodeToken } = require("./helper")
const { RecipesService, GraphQLService, TransactionService } = require("@klutch-card/klutch-js")
const httpStatus = require('http-status');


const listCategories = async (req, resp) => {
  console.log("GET /category started")
  const token = req.headers.authorization
  let decodedToken

  try {
    decodedToken = DecodeToken(token.substr(7))
  } catch (err) {
    console.log({ err })
    return resp.status(httpStatus.UNAUTHORIZED).json({ errorMessage: "Invalid token" })
  }

  const recipeInstallId = decodedToken["custom:principalId"]

  let cats

  try {
    GraphQLService.setAuthToken(BuildJWTToken())
    const recipeInstallToken = await RecipesService.getRecipeInstallToken(recipeInstallId)
    GraphQLService.setAuthToken(recipeInstallToken)

    cats = await TransactionService.getTransactionCategories()
  } catch (err) {
    console.log({ err, recipeInstallId })
    return resp.status(httpStatus.SERVICE_UNAVAILABLE).json({ errorMessage: "fail in request to graphql api" })
  }

  console.log(`GET /category finished with success`)
  return resp.status(httpStatus.OK).json(cats)
}

module.exports = { listCategories }
