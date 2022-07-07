const httpStatus = require('http-status')
const {
  GraphQLService,
  RecipesService,
  CardsService,
  TransactionService,
  CardMedia
} = require("@klutch-card/klutch-js")
const { BuildJWTToken, DecodeToken } = require('./helper')
const BurnerCard = require('../models/Card')
const { klutchServerUrl } = require("../../config")
const { KlutchJS } = require('@klutch-card/klutch-js')

KlutchJS.configure({ serverUrl: `${klutchServerUrl}/graphql` })

const listBurnerCard = async (req, resp) => {
  console.log("GET /card started")

  const token = req.headers.authorization
  let decodedToken
  try {
    decodedToken = DecodeToken(token.substr(7))
  } catch (err) {
    console.log({ err })
    return resp.status(httpStatus.UNAUTHORIZED).json({ errorMessage: "Invalid token" })
  }

  const recipeInstallId = decodedToken["custom:principalId"]

  let cardIds = []
  let result = {}

  try {
    const row = await BurnerCard.findOne({ recipeInstallId })
    cardIds = (row || { _doc: { cards: [] } })._doc.cards
  } catch (err) {
    console.log({ err, recipeInstallId })
    return resp.status(httpStatus.SERVICE_UNAVAILABLE).json({ errorMessage: "Database connection fail" })
  }

  if (cardIds.length !== 0) {
    let cards = []
    let transactions = []

    try {
      GraphQLService.setAuthToken(BuildJWTToken())
      const recipeInstallToken = await RecipesService.getRecipeInstallToken(recipeInstallId)
      GraphQLService.setAuthToken(recipeInstallToken)
      cards = await CardsService.getCards()

      GraphQLService.setAuthToken(BuildJWTToken())
      const recipeInstallTokenRefreshed = await RecipesService.getRecipeInstallToken(recipeInstallId)
      GraphQLService.setAuthToken(recipeInstallTokenRefreshed)
      transactions = await TransactionService.getTransactionsWithFilter({ cardIds })
    } catch (err) {
      console.log({ err, recipeInstallId })
      return resp.status(httpStatus.SERVICE_UNAVAILABLE).json({ errorMessage: err.message })
    }

    cards.map((card) => {
      if (cardIds.includes(card.id)) {
        result[card.id] = card
        result[card.id].transaction = undefined
        transactions.map((transaction) => {
          if (transaction.card?.id == card.id) {
            result[card.id].transaction = transaction
          }
        })
      }
    })
  }

  console.log(`recipeInstall "${recipeInstallId}" has "${cardIds.length}" burner cards\nGET /card finished with success`)

  return resp.status(httpStatus.OK).json({ cards: result })
}

const addBurnerCard = async (req, resp) => {
  console.log("POST /card started")

  const token = req.headers.authorization
  let decodedToken
  try {
    decodedToken = DecodeToken(token.substr(7))
  } catch (err) {
    console.log({ err })
    return resp.status(httpStatus.UNAUTHORIZED).json({ errorMessage: "Invalid token" })
  }

  const recipeInstallId = decodedToken["custom:principalId"]

  let row

  try {
    row = await BurnerCard.findOne({ recipeInstallId })
  } catch (err) {
    console.log({ err, recipeInstallId })
    return resp.status(httpStatus.SERVICE_UNAVAILABLE).json({ errorMessage: "Database connection fail" })
  }

  const { cards } = (row || { _doc: { cards: [] } })._doc

  let newCard

  try {
    GraphQLService.setAuthToken(BuildJWTToken())
    const recipeInstallToken = await RecipesService.getRecipeInstallToken(recipeInstallId)
    GraphQLService.setAuthToken(recipeInstallToken)

    newCard = await CardsService.addCard(`SINGLEUSE ${cards.length + 1}`, CardMedia.VIRTUAL, null)
    console.log(`new card created "${newCard.id}"`)
  } catch (err) {
    console.log({ err, recipeInstallId })
    return resp.status(httpStatus.SERVICE_UNAVAILABLE).json({ errorMessage: err.message })
  }

  try {
    await BurnerCard.findOneAndUpdate(
      { recipeInstallId },
      { $push: { cards: newCard.id } },
      { upsert: true }
    )
  } catch (err) {
    console.log({ err, recipeInstallId })
    return resp.status(httpStatus.SERVICE_UNAVAILABLE).json({ errorMessage: "Database connection error" })
  }

  console.log(`recipeInstall "${recipeInstallId}" has "${cards.length + 1}" burner cards\nPOST /card finished with success`)
  return resp.status(httpStatus.OK).json(newCard)
}

module.exports = { listBurnerCard, addBurnerCard }
