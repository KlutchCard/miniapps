import { GraphQLService, RecipesService, KlutchJS, RecipePanelSize, } from "@klutch-card/klutch-js"
import express, { NextFunction, Request, Response } from "express"
import axios from "axios"
import { BuildJWTToken } from "./helper"
import { PORT, RECIPEINSTALL_CREATED_EVENT, SERVER_URL } from "./config"


KlutchJS.configure({ serverUrl: `${SERVER_URL}/graphql` })

const middleware = (req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} ${req.method} "${req.url}" started`)
    next()
}

const healthCheckController = async (req: Request, res: Response) => {
    let responseStatus = 200
    let services = {
        klutchServer: { success: true, errorMessage: "", },
    }

    await axios({ method: 'get', url: `${SERVER_URL}/healthcheck`, })
        .catch(function (error: Error) {
            services.klutchServer.success = false
            services.klutchServer.errorMessage = "klutch server comunication fail"
            responseStatus = 503
            console.log(services.klutchServer.errorMessage, error)
        })

    res.status(responseStatus).json({ services })
}

const webhookController = async (req: Request, res: Response) => {
    const { event, principal } = req.body

    if (!event || !principal) return res.status(400).json()

    const recipeInstallId = principal.entityID
    const eventType = event._alloyCardType

    try {
        GraphQLService.setAuthToken(BuildJWTToken())
        GraphQLService.setAuthToken(await RecipesService.getRecipeInstallToken(recipeInstallId))

        if (eventType === RECIPEINSTALL_CREATED_EVENT) {
            console.log("adding home panel", { recipeInstallId })
            await RecipesService.addPanel(recipeInstallId, "/templates/Home.template",
                {}, undefined, undefined, RecipePanelSize.LARGE)
        }
    } catch (err) {
        console.log({ err, recipeInstallId })
        return res.status(503).json({ error: "Fail to request to graphql api" })
    }

    return res.status(200).json()
}

express()
    .use(middleware)
    .use(express.json())
    .get('/healthcheck', healthCheckController)
    .post('/webhook', webhookController)
    .listen(PORT, () => console.log(`runnnig on port ${PORT}`))
