const mongoose = require('mongoose')
const httpStatus = require('http-status');
var assert = require('assert')
const { KlutchJS, AuthService, RecipesService, TransactionService } = require("@klutch-card/klutch-js")
const { mongoUrl, mongoDbName, klutchServerUrl, recipeId } = require("../../../config")
const { execWebhook } = require("../../controllers/Webhook")


describe('test webhook', () => {
    let trx
    const transactionCreatedWebhook = {
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
        webhookUrl: ""
    }
    const recipeInstallCreatedWebhook = {}

    before(async () => {
        KlutchJS.configure({ serverUrl: `${klutchServerUrl}/graphql`, userPoolClientId: process.env.USER_POOL_CLIENT_ID, userPoolServer: process.env.USER_POOL_SERVER })
        await AuthService.signIn(process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD)
        await Promise.all([
            (async () => {
                const recipeInstalls = await RecipesService.findInstalledRecipes()
                const recipeInstall = recipeInstalls.find(({ recipe }) => recipe.id == recipeId)
                transactionCreatedWebhook.principal.entityID = recipeInstall.id
            })(),
            (async () => {
                const transactions = await TransactionService.getAllTransactions()
                const transaction = transactions.find(({ card }) => card.name.startsWith("SINGLEUSE"))

                if (!transaction) console.log("Transaction should be from single use card")

                transactionCreatedWebhook.event.transaction.entityID = transaction.id
                trx = await TransactionService.getTransactionDetails(transactionCreatedWebhook.event.transaction.entityID)
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
            const { status } = await execWebhook({ body: transactionCreatedWebhook }, mockResponse)
            assert.equal(status, httpStatus.OK)
        })
    })
})
