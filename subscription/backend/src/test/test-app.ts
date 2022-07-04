import chai, { expect } from "chai";
import {getSubscriptions, klutchWebhook, newSubscription, rejectSubscription} from "../app.js"

import Klutch from '../klutch.js'


const recipeInstallId = process.env.testRecipeInstallId || ""

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
  "webhookUrl": "https://hld3dl71kh.execute-api.us-west-2.amazonaws.com/klutch-webhook"
}

const exampleTransactionEvent = {
    "event": {
      "_alloyCardType": "com.alloycard.core.entities.transaction.TransactionCreatedEvent",
      "transaction": {
        "_alloyCardType": "com.alloycard.core.entities.transaction.Transaction",
        "entityID": "fbb9c255-ca01-4ff1-8be1-26aba77c5a83"
      },
      "createdAt": 1619196970,
      "eventId": "2e437043-63ea-4903-8c38-7f713f4e9c20"
    },
    "principal": {
      "_alloyCardType": "com.alloycard.core.entities.recipe.RecipeInstall",
      "entityID": recipeInstallId
    },
}


const exampleTransaction = {
  "id": "43f8ee39-6149-49e6-9339-82db57982125",
  "transactionDate": "2021-04-21T16:50:53.000Z",
  "card": {
      "id": "f7b6d963-cd12-41d5-b31f-5c31d93e934e",
      "name": "Renato Steinberg",
      "lastFour": null,
      "expirationDate": null,
      "media": "PLASTIC",
      "status": "PENDING",
      "color": "#2B2B2B",
      "isLocked": false,
      "autoLockDate": null
  },
  "transactionStatus": "PENDING",
  "merchantName": "Netflix",
  "amount": 10.05,
  "category": null,
  "mcc": "MCC(code=1234, description=null, category=null)"
}

describe('Tests SubscriptionManager', function () {

    it("RecipeInstallCreatedEvent received on Webhook", async () => {
        const recipeInstallCreatedEvent = JSON.stringify(exampleRecipeInstallCreatedEvent)
        var resp = await klutchWebhook({ body: recipeInstallCreatedEvent } as any)
        expect(resp.statusCode).to.be.equal(200)
    })

     it("Transaction received on Webhook", async () => {        
        const transaction = JSON.stringify(exampleTransactionEvent)
         var resp = await klutchWebhook({
            body: transaction
        } as any)
        chai.expect(resp.statusCode).to.be.equal(200)                
    })     

    it("New Subscription received", async () => {      
      const subscription = JSON.stringify({
        name: "Netflix",
        frequency: "MONTHLY",
        day: 5,
        transactionData: exampleTransaction
      })
      
      const jwt = await Klutch.auth(recipeInstallId)
      
      
      var resp = await newSubscription({
        headers: {
          Authorization: `Bearer ${jwt}`
        },
        body: subscription
      } as any)
      chai.expect(resp.statusCode).to.be.equal(200)
    })

    it("Get Subscription", async () => {      
      
      const jwt = await Klutch.auth(recipeInstallId)
      
        var resp = await getSubscriptions({
          headers: {
            Authorization: `Bearer ${jwt}`
          }        
        } as any)  
        console.log(resp)
        expect(resp.statusCode).to.be.equal(200)  
    })  
    
    it ("Reject next payment", async() => {
      const jwt = await Klutch.auth(recipeInstallId)
      
      var resp = await rejectSubscription({
        headers: {
          Authorization: `Bearer ${jwt}`
        }        
      } as any)  
      console.log(resp)
      expect(resp.statusCode).to.be.equal(200)  
    })
});


