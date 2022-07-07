const mongoose = require('mongoose')
const httpStatus = require('http-status');
var assert = require('assert')
const { KlutchJS, AuthService, RecipesService, CardMedia, CardStatus, CardLockState, CardsService, CardTerminateReason } = require("@klutch-card/klutch-js")
const { mongoUrl, mongoDbName, klutchServerUrl, recipeId } = require("../../../config")
const { addBurnerCard, listBurnerCard } = require("../../controllers/Card")

const mockResponse = {
    status: (status) => ({
        json: (body) => ({ status, body })
    })
}

describe('test card controller', () => {
    let token

    before(async () => {
        KlutchJS.configure({ serverUrl: `${klutchServerUrl}/graphql`, userPoolClientId: process.env.USER_POOL_CLIENT_ID, userPoolServer: process.env.USER_POOL_SERVER })
        await AuthService.signIn(process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD)
        mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, dbName: mongoDbName })

        const recipeInstalls = await RecipesService.findInstalledRecipes()
        const recipeInstall = recipeInstalls.find(({ recipe }) => recipe.id == recipeId)

        const recipeInstallToken = await RecipesService.getRecipeInstallToken(recipeInstall.id)
        token = `Bearer ${recipeInstallToken}`
    })

    after(() => { mongoose.disconnect() })

    describe('add card resource', () => {

        it('fail unauthorized', async () => {
            const req = { headers: { authorization: "token" } }
            const { status } = await addBurnerCard(req, mockResponse)
            assert.equal(status, httpStatus.UNAUTHORIZED)
        })

        it('success', async () => {
            const req = { headers: { authorization: token } }
            const { body: card, status } = await addBurnerCard(req, mockResponse)
            assert.equal(status, httpStatus.OK)
            assert.equal(card.media, CardMedia.VIRTUAL)
            assert.equal(card.status, CardStatus.PENDING)
            assert.equal(card.lockState, CardLockState.UNLOCKED)
            CardsService.cardCancel(card, CardTerminateReason.USER_REQUESTED)
        })

    })

    describe('list card resource', () => {

        it('success', async () => {
            const req = { headers: { authorization: token } }
            const { body: { cards }, status } = await listBurnerCard(req, mockResponse)
            assert.equal(status, httpStatus.OK)
            assert.notEqual(cards, undefined)
            assert.notEqual(cards, {})
        })

    })
})

module.exports = { mockResponse }
