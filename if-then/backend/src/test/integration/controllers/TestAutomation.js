const httpStatus = require('http-status');
const mongoose = require('mongoose')
var assert = require('assert')
const { addAutomation, listAutomation, validate } = require('../../../controllers/Automation')
const { klutchServerUrl, recipeId, mongoUrl, mongoDbName } = require("../../../../config")
const { KlutchJS, AuthService, RecipesService, TransactionService } = require("@klutch-card/klutch-js")


describe('test automation', () => {
    const mockResponse = {
        status: (status) => ({
            json: (body) => ({ status, body })
        })
    }

    before(async () => {
        KlutchJS.configure({ serverUrl: `${klutchServerUrl}/graphql`, userPoolClientId: process.env.USER_POOL_CLIENT_ID, userPoolServer: process.env.USER_POOL_SERVER })
        await AuthService.signIn(process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD)
        mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, dbName: mongoDbName })
    })

    after(() => { mongoose.disconnect() })

    describe('add automation resource', () => {
        const bodyExample = {
            condition: { key: "merchantAmount", title: "Amount Over Then $", value: "0" },
            action: { key: "categorizeTransaction", title: "Categorize Transaction as ", value: "junkie" }
        }
        let token

        before(async () => {
            const recipeInstalls = await RecipesService.findInstalledRecipes()
            const ifThenRecipeInstall = recipeInstalls.find(({ recipe }) => recipe.id == recipeId)

            const recipeInstallToken = await RecipesService.getRecipeInstallToken(ifThenRecipeInstall.id)
            token = `Bearer ${recipeInstallToken}`
        })

        it('success', async () => {
            const req = { body: bodyExample, headers: { authorization: token } }
            const { status } = await addAutomation(req, mockResponse)
            assert.equal(status, httpStatus.CREATED)
        })

        it('fail validation', async () => {
            const req = { body: {}, headers: { authorization: token } }
            const { status } = await addAutomation(req, mockResponse)
            assert.equal(status, httpStatus.BAD_REQUEST)
        })

        it('fail unauthorized', async () => {
            const req = { body: bodyExample, headers: { authorization: "token" } }
            const { status } = await addAutomation(req, mockResponse)
            assert.equal(status, httpStatus.UNAUTHORIZED)
        })

        it('fail db connection', async () => {
            mongoose.disconnect()
            const req = { body: bodyExample, headers: { authorization: token } }
            const { status } = await addAutomation(req, mockResponse)
            assert.equal(status, httpStatus.SERVICE_UNAVAILABLE)
            mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, dbName: mongoDbName })
        })

    })

    describe('list automation resource', () => {
        let token

        before(async () => {
            const recipeInstalls = await RecipesService.findInstalledRecipes()
            const ifThenRecipeInstall = recipeInstalls.find(({ recipe }) => recipe.id == recipeId)

            const recipeInstallToken = await RecipesService.getRecipeInstallToken(ifThenRecipeInstall.id)
            token = `Bearer ${recipeInstallToken}`
        })

        it('success', async () => {
            const req = { headers: { authorization: token } }
            const { status } = await listAutomation(req, mockResponse)
            assert.equal(status, httpStatus.OK)
        })

        it('fail unauthorized', async () => {
            const req = { headers: { authorization: "token" } }
            const { status } = await listAutomation(req, mockResponse)
            assert.equal(status, httpStatus.UNAUTHORIZED)
        })

        it('fail db connection', async () => {
            mongoose.disconnect()
            const req = { headers: { authorization: token } }
            const { status } = await listAutomation(req, mockResponse)
            assert.equal(status, httpStatus.SERVICE_UNAVAILABLE)
            mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, dbName: mongoDbName })
        })

    })

    describe('validate payload', () => {
        it('success', () => {
            const payload = {
                condition: { key: "merchantAmount", title: "Amount Over Then $", value: "0" },
                action: { key: "categorizeTransaction", title: "Categorize Transaction as ", value: "junkie" }
            }
            assert.ok(validate(payload))
        })

        it('fail', () => {
            const payload = { foo: "bar" }
            const valid = validate(payload)
            assert.equal(valid, false)
        })
    })

})
