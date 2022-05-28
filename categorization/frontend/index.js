import Server  from "./src/server.js"
import Transform from "./src/transform.js"
import qrcode from "qrcode-terminal"
import config from "./config.js"
import {internalIpV4Sync}  from "internal-ip"



function main() {
    new Transform()
    new Server().start()

    const {klutchAppLink, recipeId, port} = config

    qrcode.generate(`${klutchAppLink}?debugRecipeId=${recipeId}&debugRecipeUrl=http://${internalIpV4Sync()}:${port}`, {small: true})
}

main()


