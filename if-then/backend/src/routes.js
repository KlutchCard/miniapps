const { Router } = require("express")
const axios = require('axios')
const httpStatus = require('http-status')
const KlutchJS = require("@klutch-card/klutch-js")
const { addAutomation, listAutomation } = require("./controllers/Automation")
const { execAutomation } = require("./controllers/Webhook")
const { listCategories } = require("./controllers/Categories")
const Automation = require('./models/Automation')
const { klutchServerUrl, version } = require("../config")

const router = Router()
KlutchJS.configure({ serverUrl: klutchServerUrl })

router.get("/category", listCategories)
router.get("/automation", listAutomation)
router.post("/automation", addAutomation)
router.post("/webhook", execAutomation)

router.get("/health", async (req, resp) => {
  console.log(`GET /health started\nversion: ${version}`)

  let responseStatus = httpStatus.OK
  let services = {
    klutchServer: {
      success: true,
      errorMessage: null,
    },
    database: {
      success: true,
      errorMessage: null,
    },
  }

  const healthUrl = (klutchServerUrl.endsWith("/graphql") ?
    klutchServerUrl.substring(0, klutchServerUrl.length - 8) :
    klutchServerUrl) + "/healthcheck"

  await axios({ method: 'get', url: healthUrl })
    .catch(function (error) {
      services.klutchServer.success = false
      services.klutchServer.errorMessage = "klutch server comunication fail"
      responseStatus = httpStatus.SERVICE_UNAVAILABLE
      console.log(healthUrl, services.klutchServer.errorMessage, error)
    })

  if (Automation.collection.conn._readyState !== 1) {
    services.database.success = false
    services.database.errorMessage = "database connection fail"
    responseStatus = httpStatus.SERVICE_UNAVAILABLE
    console.log(services.klutchServer.errorMessage)
  }

  return resp.status(responseStatus).json({ name: "if-then", services, version })
})

module.exports = { router }
