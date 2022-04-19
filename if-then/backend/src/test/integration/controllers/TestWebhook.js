var assert = require('assert')
const { KlutchJS, AuthService, RecipesService, TransactionService } = require("@klutch-card/klutch-js")
const { klutchServerUrl, recipeId } = require("../../../../config")
const { validate } = require('../../../controllers/Webhook')


describe('test webhook', () => {
    before(async () => {
        KlutchJS.configure({ serverUrl: `${klutchServerUrl}/graphql`, userPoolClientId: process.env.USER_POOL_CLIENT_ID, userPoolServer: process.env.USER_POOL_SERVER })
    })


    describe('validate payload', () => {
        let recipeInstallId = ''
        let transactionId = ''

        before(async () => {
            await AuthService.signIn(process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD)

            await Promise.all([
                async () => {
                    const recipeInstalls = await RecipesService.findInstalledRecipes()
                    const recipeInstall = recipeInstalls.find(({ recipe }) => recipe.id == recipeId)
                    recipeInstallId = recipeInstall.id
                },
                async () => {
                    const transactions = await TransactionService.getAllTransactions()
                    transactionId = transactions[0].id
                },
            ])
        })

        it('success', () => {
            var payload = {
                principal: {
                    _alloyCardType: "com.alloycard.core.entities.recipe.RecipeInstall",
                    entityID: recipeInstallId
                },
                event: {
                    _alloyCardType: "com.alloycard.core.entities.transaction.TransactionCreatedEvent",
                    transaction: {
                        _alloyCardType: "com.alloycard.core.entities.transaction.Transaction",
                        entityID: transactionId
                    },
                    createdAt: 1636006199,
                    eventId: "ad2e1f37-2f36-4978-bd85-2220776064bb"
                },
                webhookUrl: "https://ifthen-miniapp.klutchcard.com/webhook"
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
