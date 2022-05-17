const { expect } = require("chai")
const { createOrUpdateBudget, getBudgets, deleteBudget } = require('../controllers/BudgetController')
const {auth} = require("../controllers/helper")

const recipeInstallId = process.env.testRecipeInstallId || ""




describe('Test Monthly Budget', function() {
    it("Get Budgets", async () => {
        const jwt = await auth(recipeInstallId)
        var status = ""
        var result = ""


        
        await getBudgets({headers: {
            authorization: `Bearer ${jwt}`
        }}, {status: (code => {
                status = code 
                return {json: (message => {
                    result = message
                })}
            })})
        console.log(result)
        expect(status).to.be.equal(200)
        
    })

})