const { RecipesService } = require("@klutch-card/klutch-js")
const httpStatus = require('http-status')


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
  try {
    const panels = await RecipesService.getPanels(undefined)
    const panelsRecipeInstallId = panels.map(p => p.recipeInstall.id)

    if (panelsRecipeInstallId.includes(recipeInstallId)) return

    console.log(`adding home panel to recipeInstallId \"${recipeInstallId}\"`)

    await RecipesService.addPanel(recipeInstallId, "/templates/HomePanel.template", { recipeId }, null)
  } catch (err) {
    console.log({ err, recipeInstallId })
  }
}

module.exports = { execWebhook }
