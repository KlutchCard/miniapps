const { RecipesService, GraphQLService, TransactionService } = require("@klutch-card/klutch-js")
const { getRecipeInstallId } = require("./BudgetController")
const httpStatus = require('http-status');
const { recipeId, privateKey } = require('../config/config')

const listCategories = async (req, resp) => {
  console.log("GET /category started")

  let recipeInstallId
  try {
    recipeInstallId = getRecipeInstallId(req.headers.authorization)
  } catch (err) {
    console.log({ err })
    return resp.status(httpStatus.UNAUTHORIZED).json({ errorMessage: "Invalid token" })
  }

  let cats = []

  try {
    GraphQLService.setAuthToken(RecipesService.buildRecipeToken(recipeId, privateKey))
    const recipeInstallToken = await RecipesService.getRecipeInstallToken(recipeInstallId)
    GraphQLService.setAuthToken(recipeInstallToken)

    cats = await TransactionService.getTransactionCategories()
  } catch (err) {
    console.log({ err, recipeInstallId })
    return resp.status(httpStatus.SERVICE_UNAVAILABLE).json({ errorMessage: 'fail in fetch categories from server' })
  }

  console.log(`recipeInstall "${recipeInstallId}" has "${cats.length}" categories\nGET /category finished with success`)
  return resp.status(httpStatus.OK).json(cats)
}

module.exports = { listCategories }
