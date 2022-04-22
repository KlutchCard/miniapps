import {expect} from "chai";
import {handleGetCategories, handleWebhook} from "../app.js"
import Klutch from "../klutch"


const recipeInstallId = process.env.testRecipeInstallId



describe('Tests Categorization', function () {

    it("Transaction categories", async () => {                
        const token = await Klutch.auth(recipeInstallId!!)
        var resp = await handleGetCategories({
            headers: {
                authorization: `Bearer ${token}`
            },
            body: ""
        } as any)
        expect(resp.statusCode).to.be.equal(200)                
    }) 

});