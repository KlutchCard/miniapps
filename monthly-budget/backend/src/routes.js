const axios = require('axios')
const { Router } = require("express")
const httpStatus = require('http-status')
const { klutchServerUrl, database } = require("../src/config/config")
const { createOrUpdateBudget, getBudgets, deleteBudget } = require('./controllers/BudgetController')
const connection = require('./database/index')


const router = Router()

router.put("/budget", createOrUpdateBudget)
router.get("/budget", getBudgets)
router.delete("/budget/:id", deleteBudget)
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
      databaseName: database.database,
    },
  }

  await axios({ method: 'get', url: `${klutchServerUrl}/healthcheck`, })
    .catch(function (error) {
      services.klutchServer.success = false
      services.klutchServer.errorMessage = "klutch server comunication fail"
      responseStatus = httpStatus.SERVICE_UNAVAILABLE
      console.log(services.klutchServer.errorMessage, error)
    })

  await connection.authenticate()
    .catch(err => {
      services.database.success = false
      services.database.errorMessage = "database connection fail"
      responseStatus = httpStatus.SERVICE_UNAVAILABLE
      console.log(services.database.errorMessage, err)
    })

  return resp.status(responseStatus).json({ services })
})

module.exports = { router }
