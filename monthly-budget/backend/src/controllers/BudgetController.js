const { RecipesService } = require("@klutchcard/alloy-js");
const httpStatus = require('http-status')
const Ajv = require("ajv")
const { upsertBudget, listBudgets } = require("../models/Budget")


const ajv = new Ajv()

const validate = ajv.compile({
  type: "object",
  properties: {
    amount: { type: "number" },
    category: { type: "string" },
  },
  required: ["amount", "category"],
})

const getRecipeInstallId = (token) => {
  const decodedToken = RecipesService.decodeJwtToken(token.substr(7))
  return decodedToken["custom:principalId"]
}

const createOrUpdateBudget = async (req, resp) => {
  console.log("POST /budget started")

  let recipeInstallId
  try {
    recipeInstallId = getRecipeInstallId(req.headers.authorization)
  } catch (err) {
    console.log({ err })
    return resp.status(httpStatus.UNAUTHORIZED).json({ errorMessage: "Invalid token" })
  }

  if (!validate(req.body)) {
    return resp.status(httpStatus.BAD_REQUEST).json({ errorMessage: validate.errors })
  }

  const { category, amount } = req.body

  console.log(`new budget creating: "${{ category, recipeInstallId }}"`)

  try {
    const row = await upsertBudget(recipeInstallId, category, amount)
    console.log("POST /budget finished with success")
    return resp.status(httpStatus.OK).json(row)
  } catch (err) {
    console.log({ err })
    return resp.status(httpStatus.SERVICE_UNAVAILABLE).json({ errorMessage: 'fail in connect with database' })
  }
}

const getBudgets = async (req, resp) => {
  console.log("GET /budget started")

  let recipeInstallId
  try {
    recipeInstallId = getRecipeInstallId(req.headers.authorization)
  } catch (err) {
    console.log({ err })
    return resp.status(httpStatus.UNAUTHORIZED).json({ errorMessage: "Invalid token" })
  }

  try {
    const rows = await listBudgets(recipeInstallId)
    console.log(`recipeInstall "${recipeInstallId}" has "${rows.length}" budgets\nGET /budget finished with success`)
    return resp.status(httpStatus.OK).json(rows)
  } catch (err) {
    console.log({ err })
    return resp.status(httpStatus.SERVICE_UNAVAILABLE).json({ errorMessage: 'fail in connect with database' })
  }
}

module.exports = { createOrUpdateBudget, getBudgets }