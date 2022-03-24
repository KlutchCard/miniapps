const {
  RecipesService,
  GraphQLService,
  TransactionService,
  CardsService,
  Card,
  CardTerminateReason,
  TransactionType } = require("@klutch-card/klutch-js")
const httpStatus = require('http-status');
const { BuildJWTToken } = require("./helper")
const { recipeInstallCreatedEventType, transactionCreatedEventType } = require('../../config')
const BurnerCard = require('../models/Card');


const execWebhook = async (req, resp) => {
  console.log("POST /webhook started")

  const { event, principal } = req.body

  if (!event || !principal) {
    console.log(`payload is missing event or principal objects`)
    return resp.status(httpStatus.BAD_REQUEST).json()
  }

  const recipeInstallId = principal.entityID

  if (event._alloyCardType === recipeInstallCreatedEventType) {
    console.log(`adding home panel to recipeInstallId \"${recipeInstallId}\"`)

    const jwtToken = BuildJWTToken()
    GraphQLService.setAuthToken(jwtToken)

    try {
      const recipeInstallToken = await RecipesService.getRecipeInstallToken(recipeInstallId)
      GraphQLService.setAuthToken(recipeInstallToken)
      await RecipesService.addPanel(recipeInstallId, "/templates/Home.template", {}, null, 60)
      console.log(`POST /webhook "${event._alloyCardType}" finished with success`)
      return resp.status(httpStatus.OK).json()
    } catch (err) {
      console.log({ err, recipeInstallId })
      return resp.status(httpStatus.SERVICE_UNAVAILABLE).json({ errorMessage: err.message })
    }
  }

  if (event._alloyCardType !== transactionCreatedEventType) {
    console.log(`event type "${event._alloyCardType} hasn't a handler`)
    return resp.status(httpStatus.OK).json()
  }

  let row

  try {
    row = await BurnerCard.findOne({ recipeInstallId })
  } catch (err) {
    console.log({ err, recipeInstallId })
    return resp.status(httpStatus.SERVICE_UNAVAILABLE).json({ errorMessage: "Database connection fail" })
  }

  if (!row) {
    console.log(`recipeInstall "${recipeInstallId}" has no burner cards`)
    return resp.status(httpStatus.OK).json()
  }

  const { cards } = (row || { _doc: { cards: [] } })._doc

  console.log(`recipeInstall "${recipeInstallId}" has "${cards.length}" burner cards`)

  const jwtToken = BuildJWTToken()
  GraphQLService.setAuthToken(jwtToken)

  try {
    // TODO encapsulate statement on a method
    const recipeInstallToken = await RecipesService.getRecipeInstallToken(recipeInstallId)
    GraphQLService.setAuthToken(recipeInstallToken)

    const transaction = await TransactionService.getTransactionDetails(event.transaction.entityID)

    if (transaction.transactionType === TransactionType.DEPOSIT) {
      console.log(`transaction "${transaction.id}" is "${TransactionType.DEPOSIT}" type`)
      return resp.status(httpStatus.OK).json()
    }

    if (!cards.includes(transaction.card.id)) return resp.status(httpStatus.OK).json()

    await CardsService.cardCancel(new Card({ id: transaction.card.id }), CardTerminateReason.USER_REQUESTED)
  } catch (err) {
    console.log({ err, recipeInstallId })
    return resp.status(httpStatus.SERVICE_UNAVAILABLE).json({ errorMessage: err.message })
  }

  console.log(`POST /webhook "${event._alloyCardType}" finished with success`)
  return resp.status(httpStatus.OK).json()
}

module.exports = { execWebhook }
