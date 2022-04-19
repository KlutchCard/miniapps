const httpStatus = require('http-status');
const mongoose = require('mongoose')
var assert = require('assert')
const { addAutomation, validate } = require('../../../controllers/Automation')
const { klutchServerUrl, recipeId, mongoUrl, mongoDbName } = require("../../../../config")
const { KlutchJS, AuthService, RecipesService, TransactionService } = require("@klutch-card/klutch-js")


describe('test automation', () => {
    before(async () => {
        KlutchJS.configure({ serverUrl: `${klutchServerUrl}/graphql`, userPoolClientId: process.env.USER_POOL_CLIENT_ID, userPoolServer: process.env.USER_POOL_SERVER })
        await AuthService.signIn(process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD)
        mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, dbName: mongoDbName })
    })

    after(() => { mongoose.disconnect() })

    describe('add automation resource', () => {
        let req = {
            body: {}, headers: { authorization: '', 'Content-Type': 'application/json' },
        }
        let resp = {
            status: (status) => ({
                json: (body) => ({ status, body })
            })
        }

        before(async () => {
            req.body = {
                condition: { key: "merchantAmount", title: "Amount Over Then $", value: "0" },
                action: { key: "categorizeTransaction", title: "Categorize Transaction as ", value: "junkie" }
            }

            const recipeInstalls = await RecipesService.findInstalledRecipes()
            const ifThenRecipeInstall = recipeInstalls.find(({ recipe }) => recipe.id == recipeId)

            const token = await RecipesService.getRecipeInstallToken(ifThenRecipeInstall.id)
            req.headers.authorization = `Bearer ${token}`
        })

        it('sucess', async () => {
            const { status } = await addAutomation(req, resp)
            assert.equal(status, httpStatus.CREATED)
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
