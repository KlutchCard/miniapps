const mongoose = require('mongoose')
const httpStatus = require('http-status');
var assert = require('assert')
const { KlutchJS, AuthService, RecipesService } = require("@klutch-card/klutch-js")
const { mongoUrl, mongoDbName, klutchServerUrl, recipeId } = require("../../../config")
const { addBurnerCard } = require("../../controllers/Card")

KlutchJS.configure({
    serverUrl: `${klutchServerUrl}/graphql`,
    userPoolClientId: process.env.USER_POOL_CLIENT_ID,
    userPoolServer: process.env.USER_POOL_SERVER
})

const mockResponse = {
    status: (status) => ({
        json: (body) => ({ status, body })
    })
}

describe('test card controller', () => {

    before(async () => {
        await AuthService.signIn(process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD)
        mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, dbName: mongoDbName })
    })

    describe('add automation resource', () => {
        let token

        before(async () => {
            const recipeInstalls = await RecipesService.findInstalledRecipes()
            const recipeInstall = recipeInstalls.find(({ recipe }) => recipe.id == recipeId)

            const recipeInstallToken = await RecipesService.getRecipeInstallToken(recipeInstall.id)
            token = `Bearer ${recipeInstallToken}`
        })

        it('success', async () => {
            const req = { headers: { authorization: token } }
            const { status } = await addBurnerCard(req, mockResponse)
            assert.equal(status, httpStatus.OK)
        })

        it('fail unauthorized', async () => {
            const req = { headers: { authorization: "token" } }
            const { status } = await addBurnerCard(req, mockResponse)
            assert.equal(status, httpStatus.UNAUTHORIZED)
        })

        it('fail db connection', async () => {
            mongoose.disconnect()
            const req = { headers: { authorization: token } }
            const { status } = await addBurnerCard(req, mockResponse)
            assert.equal(status, httpStatus.SERVICE_UNAVAILABLE)
            mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, dbName: mongoDbName })
        })

    })

})
