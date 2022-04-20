const mongoose = require('mongoose')
const httpStatus = require('http-status');
var assert = require('assert')
const { KlutchJS, AuthService, RecipesService, TransactionService, CardsService, CardLockState } = require("@klutch-card/klutch-js")
const { klutchServerUrl, recipeId, mongoUrl, mongoDbName } = require("../../../../config")
const { execAutomation, handleRule, validate } = require('../../../controllers/Webhook')


describe('test webhook', () => {
    const payload = {
        principal: {
            _alloyCardType: "com.alloycard.core.entities.recipe.RecipeInstall",
            entityID: "",
        },
        event: {
            _alloyCardType: "com.alloycard.core.entities.transaction.TransactionCreatedEvent",
            transaction: {
                _alloyCardType: "com.alloycard.core.entities.transaction.Transaction",
                entityID: "",
            },
            createdAt: 1636006199,
            eventId: "ad2e1f37-2f36-4978-bd85-2220776064bb"
        },
        webhookUrl: "https://ifthen-miniapp.klutchcard.com/webhook"
    }

    before(async () => {
        KlutchJS.configure({ serverUrl: `${klutchServerUrl}/graphql`, userPoolClientId: process.env.USER_POOL_CLIENT_ID, userPoolServer: process.env.USER_POOL_SERVER })
        await AuthService.signIn(process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD)
        await Promise.all([
            (async () => {
                const recipeInstalls = await RecipesService.findInstalledRecipes()
                const recipeInstall = recipeInstalls.find(({ recipe }) => recipe.id == recipeId)
                payload.principal.entityID = recipeInstall.id
            })(),
            (async () => {
                const transactions = await TransactionService.getAllTransactions()
                payload.event.transaction.entityID = transactions[0].id
            })(),
        ])
        mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, dbName: mongoDbName })
    })

    after(() => { mongoose.disconnect() })

    describe('exec webhook resource', () => {
        const mockResponse = {
            status: (status) => ({
                json: (body) => ({ status, body })
            })
        }

        it('success', async () => {
            const { status } = await execAutomation({ body: payload }, mockResponse)
            assert.equal(status, httpStatus.OK)
        })

        it('fail validation', async () => {
            const { status } = await execAutomation({ body: {} }, mockResponse)
            assert.equal(status, httpStatus.BAD_REQUEST)
        })

        it('fail db connection', async () => {
            mongoose.disconnect()
            const { status } = await execAutomation({ body: payload }, mockResponse)
            assert.equal(status, httpStatus.SERVICE_UNAVAILABLE)
            mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, dbName: mongoDbName })
        })

    })

    describe('handle rule function', () => {
        let trx

        before(async () => {
            trx = await TransactionService.getTransactionDetails(payload.event.transaction.entityID)
        })

        describe('categorize transaction', () => {
            it('success', async () => {
                const rule = {
                    condition: { key: "merchantAmount", title: "Amount Over Then $", value: "0" },
                    action: { key: "categorizeTransaction", title: "Categorize Transaction as ", value: "food" }
                }

                try {
                    const categories = await TransactionService.getTransactionCategories()
                    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
                    rule.action.value = randomCategory.name

                    await handleRule(rule, trx, payload.principal.entityID)
                    const trxUpdated = await TransactionService.getTransactionDetails(payload.event.transaction.entityID)
                    assert.equal(trxUpdated.category.name.toUpperCase(), rule.action.value.toUpperCase())
                } catch (error) {
                    assert.fail(error.message)
                }
            })
        })

        describe('freeze card', () => {
            it('success', async () => {
                const rule = {
                    condition: { key: "merchantAmount", title: "Amount Over Then $", value: "0" },
                    action: { key: "freezeCard", title: "Autolock Card", }
                }

                try {
                    await handleRule(rule, trx, payload.principal.entityID)
                    const trxUpdated = await TransactionService.getTransactionDetails(payload.event.transaction.entityID)
                    assert.equal(trxUpdated.card.lockState, CardLockState.LOCKING)

                    CardsService.unlock(trx.card)
                } catch (error) {
                    assert.fail(error.message)
                }
            })
        })

    })

    describe('validate payload', () => {
        it('success', () => {
            assert.ok(validate(payload))
        })

        it('fail', () => {
            const payload = { foo: "bar" }
            const valid = validate(payload)
            assert.equal(valid, false)
        })
    })

})
