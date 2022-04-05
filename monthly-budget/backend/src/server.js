const { KlutchJS } = require("@klutch-card/klutch-js")
const express = require('express')
const { router } = require('./routes')
const { port, klutchServerUrl, klutchPublicKey, version } = require('../src/config/config')
require('./database')

const app = express()
app.use(express.json())
app.use(router)

KlutchJS.configure({ serverUrl: `${klutchServerUrl}/graphql`, klutchPublicKey })

app.listen(port, () => console.log(`Server is running on port ${port}\tversion: ${version}`))
