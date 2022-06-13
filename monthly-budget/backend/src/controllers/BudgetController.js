const {
  GraphQLService,
  RecipesService,
  TransactionService,
  TransactionType,
  TransactionStatus
} = require("@klutch-card/klutch-js")
const httpStatus = require('http-status')
const Ajv = require("ajv")
const { upsertBudget, listBudgets, deleteBudget: findAndDeleteBudget } = require("../models/Budget")
const { recipeId, privateKey } = require('../config/config')


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

const splitTransactionsPerCategory = (transactions) => {
  const result = {}

  transactions.map(t => {
    if (t.category) {
      const categoryName = t.category.name.toUpperCase().trim()

      if (result[categoryName]) {
        result[categoryName].push(t)
      } else {
        result[categoryName] = [t]
      }
    }
  })

  return result
}

const handlerTransactionsDataPerBudgets = (budgets, transactions) => {
  const transactionsSplitted = splitTransactionsPerCategory(transactions)
  return budgets.map(budget => {
    const categoryName = budget.category.toUpperCase().trim()
    const trxs = transactionsSplitted[categoryName] || []

    let result = { ...budget.dataValues }
    result.spent = trxs.reduce((accum, item) => accum + item.amount, 0)
    // result.transactions = trxs
    return result
  })
}

const createOrUpdateBudget = async (req, resp) => {
  console.log("PUT /budget started")

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
    console.log("PUT /budget finished with success")
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
    console.log({ err, token: req.headers.authorization })
    return resp.status(httpStatus.UNAUTHORIZED).json({ errorMessage: "Invalid token" })
  }

  let budgets = []

  try {
    budgets = await listBudgets(recipeInstallId)
  } catch (err) {
    console.log({ err })
    return resp.status(httpStatus.SERVICE_UNAVAILABLE).json({ errorMessage: 'fail in connect with database' })
  }

  let transactions = []

  try {
    GraphQLService.setAuthToken(RecipesService.buildRecipeToken(recipeId, privateKey))
    const recipeInstallToken = await RecipesService.getRecipeInstallToken(recipeInstallId)
    GraphQLService.setAuthToken(recipeInstallToken)
  } catch (err) {
    console.log({ err })
    return resp.status(httpStatus.INTERNAL_SERVER_ERROR).json({ errorMessage: 'fail build authorization token' })
  }

  try {
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const filters = {
      startDate,
      endDate,
      transactionTypes: [TransactionType.CHARGE],
      transactionStatus: [TransactionStatus.PENDING, TransactionStatus.SETLLED]
    }

    transactions = await TransactionService.getTransactionsWithFilter(filters)

  } catch (err) {
    console.log({ err })
    return resp.status(httpStatus.SERVICE_UNAVAILABLE).json({ errorMessage: 'fail in fetch transactions from server' })
  }

  const result = handlerTransactionsDataPerBudgets(budgets, transactions)

  console.log(`recipeInstall "${recipeInstallId}" has "${result.length}" budgets\nGET /budget finished with success`)

  return resp.status(httpStatus.OK).json(result)
}

const deleteBudget = async (req, resp) => {
  const { id } = req.params
  console.log(`DELETE /budget/${id} started`)

  try {
    getRecipeInstallId(req.headers.authorization)
  } catch (err) {
    console.log({ err })
    return resp.status(httpStatus.UNAUTHORIZED).json({ errorMessage: "Invalid token" })
  }

  try {
    await findAndDeleteBudget(id)
  } catch (err) {
    console.log({ err })
    return resp.status(httpStatus.SERVICE_UNAVAILABLE).json({ errorMessage: 'fail in connect with database' })
  }

  console.log(`DELETE /budget/${id} finished with success`)
  return resp.status(httpStatus.OK).json(null)
}

module.exports = { createOrUpdateBudget, getBudgets, deleteBudget, getRecipeInstallId }
