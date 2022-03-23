const {
  GraphQLService,
  RecipesService,
} = require("@klutch-card/klutch-js")
const httpStatus = require('http-status')
const { recipeId, privateKey } = require('../config/config')
const { BuildJWTToken } = require('./helper')


const execWebhook = async (req, resp) => {
  console.log("POST /webhook started")

  const { event, principal } = req.body

  if (!event || !principal) {
    console.log(`payload is missing event or principal objects`)
    return resp.status(httpStatus.BAD_REQUEST).json()
  }

  const recipeInstallId = principal.entityID

  if (event._alloyCardType === "com.alloycard.core.entities.recipe.RecipeInstallCreatedEvent") {
    console.log(`adding home panel to recipeInstallId \"${recipeInstallId}\"`)

    try {
      await addPanelToHomeScreen(recipeInstallId)
      console.log(`POST /webhook "${event._alloyCardType}" finished with success`)
      return resp.status(httpStatus.OK).json()
    } catch (err) {
      console.log({ err, recipeInstallId })
      return resp.status(httpStatus.SERVICE_UNAVAILABLE).json({ errorMessage: err.message })
    }
  }

  console.log(`POST /webhook "${event._alloyCardType}" finished with success`)
  return resp.status(httpStatus.OK).json()
}

const addPanelToHomeScreen = async (recipeInstallId) => {
  const templatePath = "/templates/HomePanel.template"

  const recipeToken = BuildJWTToken(recipeId, privateKey)
  GraphQLService.setAuthToken(recipeToken)
  const recipeInstallToken = await RecipesService.getRecipeInstallToken(recipeInstallId)
  GraphQLService.setAuthToken(recipeInstallToken)

  const panels = await RecipesService.getPanels(undefined)
  const panel = panels.find(p => (p.recipeInstall.id === recipeInstallId && p.templateFile.fileName === templatePath))

  if (panel) {
    console.log(`home panel ${panel.id} already exists`)
    return
  }

  const recipePanel = await RecipesService.addPanel(recipeInstallId, templatePath, { recipeId }, null)
  console.log(`home panel ${recipePanel.id} added`)
}

module.exports = { execWebhook }
