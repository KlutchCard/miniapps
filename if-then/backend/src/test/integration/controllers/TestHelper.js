const { BuildJWTToken, DecodeToken } = require('../../../controllers/helper')
var assert = require('assert')
const { KlutchJS, AuthService, RecipesService } = require("@klutch-card/klutch-js")
const { klutchServerUrl, recipeId } = require("../../../../config")

KlutchJS.configure({
    serverUrl: `${klutchServerUrl}/graphql`,
    userPoolClientId: process.env.USER_POOL_CLIENT_ID,
    userPoolServer: process.env.USER_POOL_SERVER
})

describe('test helper module', () => {
    describe('build jwt token', () => {
        it('success', () => {
            const token = BuildJWTToken()
            assert.notEqual(token, '')
        })
    })

    describe('decode token', () => {
        let token = ''
        before(async () => {
            await AuthService.signIn(process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD)

            const recipeInstalls = await RecipesService.findInstalledRecipes()
            const ifThenRecipeInstall = recipeInstalls.find(({ recipe }) => recipe.id == recipeId)
            token = await RecipesService.getRecipeInstallToken(ifThenRecipeInstall.id)
        })

        it('success', () => {
            DecodeToken(token)
        })

        it('fail', () => {
            try {
                DecodeToken("token")
            } catch (error) {
                assert.ok(error.message.includes('jwt malformed'))
                return
            }
            assert.fail(`must fail`)
        })
    })

})
