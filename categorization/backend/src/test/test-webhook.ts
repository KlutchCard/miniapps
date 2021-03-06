import {expect} from "chai";
import {handleWebhook} from "../app.js"

const recipeInstallId = process.env.testRecipeInstallId

const exampleRecipeInstallCreatedEvent = {
  "principal": {
    "_alloyCardType": "com.alloycard.core.entities.recipe.RecipeInstall",
    "entityID": recipeInstallId
  },
  "event": {
    "_alloyCardType": "com.alloycard.core.entities.recipe.RecipeInstallCreatedEvent",
    "createdAt": 1629129978,
    "eventId": "xpto"
  },
  "webhookUrl": "https://dn0xoemayc.execute-api.us-west-2.amazonaws.com/klutch-webhook"
}

const exampleTransactionEvent = {
    "principal": {
      "_alloyCardType": "com.alloycard.core.entities.recipe.RecipeInstall",
      "entityID": recipeInstallId
    },
    "event": {
      "_alloyCardType": "com.alloycard.core.entities.transaction.TransactionCreatedEvent",
      "transaction": {
        "_alloyCardType": "com.alloycard.core.entities.transaction.Transaction",
        "entityID": "18c13a4d-4a05-4704-bff5-6f348e05b81e"
      },
      "createdAt": 1629835288,
      "eventId": "01ad935f-a162-4be5-985e-870de23e1f97"
    },
    "webhookUrl": "https://categorization.url/webhook"
  }

describe('Tests SubscriptionManager', function () {
  it("RecipeInstallCreated event received on Webhook", async () => {
    const transaction = JSON.stringify(exampleRecipeInstallCreatedEvent)
    var resp = await handleWebhook({
      body: transaction
    } as any)
    expect(resp.statusCode).to.be.equal(200)
  })


    it("Transaction received on Webhook", async () => {        
        const transaction = JSON.stringify(exampleTransactionEvent)
         var resp = await handleWebhook({
            body: transaction
        } as any)
        expect(resp.statusCode).to.be.equal(200)                
    })       
});