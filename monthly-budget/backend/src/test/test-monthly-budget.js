const { expect } = require("chai")
const { createOrUpdateBudget, getBudgets, deleteBudget } = require('../controllers/BudgetController')



describe('Test Monthly Budget', function() {
    it("Get Budgets", async () => {
        getBudgets({headers: {
            authorization: ""
        }}, {})
    })

})