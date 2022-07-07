const axios = require('axios')
const { Router } = require("express")
const httpStatus = require('http-status')
const { execWebhook } = require("./controllers/Webhook")
const KlutchJS = require("@klutch-card/klutch-js")
const { listBurnerCard, addBurnerCard } = require("./controllers/Card")
const { mongoDbName, klutchServerUrl, version } = require("../config")
const BurnerCard = require('./models/Card');

const router = Router()
KlutchJS.configure({ serverUrl: `${klutchServerUrl}/graphql` })

router.get("/card", listBurnerCard)
router.post("/card", addBurnerCard)
router.post("/webhook", execWebhook)

router.get("/health", async (req, resp) => {
  let responseStatus = httpStatus.OK
  let services = {
    klutchServer: {
      success: true,
      errorMessage: null,
    },
    database: {
      success: true,
      errorMessage: null,
      databaseName: mongoDbName,
    },
  }

  await axios({ method: 'get', url: `${klutchServerUrl}/healthcheck`, })
    .catch(function (error) {
      services.klutchServer.success = false
      services.klutchServer.errorMessage = "klutch server comunication fail"
      responseStatus = httpStatus.SERVICE_UNAVAILABLE
      console.log(services.klutchServer.errorMessage, error)
    })

  if (BurnerCard.collection.conn._readyState !== 1) {
    services.database.success = false
    services.database.errorMessage = "database connection fail"
    responseStatus = httpStatus.SERVICE_UNAVAILABLE
    console.log(services.klutchServer.errorMessage)
  }

  return resp.status(responseStatus).json({ services, version })
})

module.exports = { router }
