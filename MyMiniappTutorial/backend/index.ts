import express, { NextFunction, Request, Response } from "express"
import axios from "axios"

const PORT = 3004
const SERVER_URL = "https://sandbox.klutchcard.com"

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

express()
    .use(middleware)
    .use(express.json())
    .get('/healthcheck', healthCheckController)
    .listen(PORT, () => console.log(`runnnig on port ${PORT}`))
