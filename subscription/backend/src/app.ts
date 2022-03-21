"use strict";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {AlloyEvent, Entity, GraphQLService, RecipesService, Transaction, TransactionService} from "@klutch-card/klutch-js"
import Klutch from "./klutch.js";
import db from "./db.js"
import auth from "./auth.js"
import { v4 as uuidv4 } from 'uuid';
import  { DateTime } from "luxon"


const SubscriptionTable = process.env.SubscriptionTable as string 
const SubscriptionTransactionTable = process.env.SubscriptionTransactionTable as string

type Subscription = {
    subscriptionId: string,
    recipeInstallId: string,
    name: string,
    frequency: "WEEKLY" | "MONTHLY" | "YEARLY",
    day: number,
    month: number,
    weekday: number    
}       

const Months: { [key: string]: number }  = {
    "JANUARY": 1,
    "FEBRUARY": 2,
    "MARCH": 3, 
    "APRIL": 4,
    "MAY": 5,
    "JUNE": 6,
    "JULY": 7,
    "AUGUST": 8,
    "SEPTEMBER": 9,
    "OCTOBER": 10,
    "NOVEMBER": 11,
    "DECEMBER": 12
}

export const klutchWebhook = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {    

    if (!event.body) {
        return {
            statusCode: 400,
            body: "Body cannot be null"   
        }
    }    
    const alloyEvent = JSON.parse(event.body)
    console.log("New Message:", JSON.stringify(alloyEvent))
    var panel = {}
    if (alloyEvent.event._alloyCardType == "com.alloycard.core.entities.transaction.TransactionCreatedEvent") {
        const recipeInstallId = alloyEvent.principal.entityID  
        const transaction = alloyEvent.event.transaction
        await Klutch.auth(recipeInstallId)
        var transactionData = await TransactionService.getTransactionDetails(transaction.entityID)
        const subscription = await checkForSubscriptions(recipeInstallId, transactionData)
        var {transactionDate,  ...td} = transactionData
        if (subscription) {            
            const subs = await fetchSubscriptions(recipeInstallId)
            const s  = subs?.find(c => c.subscriptionId == subscription.subscriptionId)
            db.insert(SubscriptionTransactionTable, {recipeInstallId: recipeInstallId, subscriptionId: s, subscription, transactionDate: "" + transactionDate,  ...td})            
            panel = await RecipesService.addPanel(recipeInstallId, "/templates/TransactionSubscription.template", {transaction: transactionData, subscription: s}, new Entity({entityID: transaction.entityID, type: "com.alloycard.core.entities.transaction.Transaction"}))
        } else {
            panel = await RecipesService.addPanel(recipeInstallId, "/templates/Transaction.template", transactionData, new Entity({entityID: transaction.entityID, type: "com.alloycard.core.entities.transaction.Transaction"}))
        }
        
        console.log("Finished")
    }

    if (alloyEvent.event._alloyCardType == "com.alloycard.core.entities.recipe.RecipeInstallCreatedEvent") {
        const recipeInstallId = alloyEvent.recipeInstall.entityID
        await Klutch.auth(recipeInstallId)
        var token = event.headers["Authorization"] || event.headers["authorization"] || ""
        await refreshHomePanel(recipeInstallId, token)

        console.log("Finished")
    }

    return {
        statusCode: 200,
        body: JSON.stringify(panel)
    }
}

export const newSubscription = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Event", event)
    if (!event.body) {
        return {
            statusCode: 400,
            body: "Body cannot be null"   
        }
    }
    
    var token = event.headers["Authorization"] || event.headers["authorization"] || ""
    
    if (token.startsWith("Bearer ")) {
        token = token.substr(7)
    }
    const jwt = auth.auth(token)
    const recipeInstallId = jwt["custom:principalId"]


    var subscription = JSON.parse(event.body) 
    var transaction  = subscription.transaction
    
    const subscriptionId = uuidv4()    
    console.log("b4 insert")
    await db.insert(SubscriptionTable, {
        subscriptionId, 
        recipeInstallId, 
        name: subscription.name, 
        amount: subscription.amount,
        frequency: subscription.frequency,
        day: subscription.day,
        month: subscription.month,
        weekday: subscription.weekday} as Subscription)
        
    await db.insert(SubscriptionTransactionTable, {recipeInstallId: recipeInstallId, subscriptionId, transactionDate: transaction.transactionDate, ...transaction})
    console.log("aft insert")
    const subscriptions = await fetchSubscriptions(recipeInstallId)    
    console.log("aft subs")
    subscription = subscriptions?.find(c => c.subscriptionId == subscriptionId)
    await Klutch.addPanel(recipeInstallId, "/templates/TransactionSubscription.template", {transaction: transaction, subscription: subscription},  new Entity({entityID: transaction.id, type: "com.alloycard.core.entities.transaction.Transaction"}), token)        
    await refreshHomePanel(recipeInstallId, token)    
    console.log("aft panels")
   
    console.log("FINISHED")

    return {
        statusCode: 200,
        body:  JSON.stringify(subscription)
    }    
}   


export const getSubscriptions = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Event", event)

    var token = event.headers["authorization"] || ""
    if (token.startsWith("Bearer ")) {
        token = token.substr(7)
    }

    const jwt = auth.auth(token)
    const recipeInstallId = jwt["custom:principalId"]

    const subscriptions = await fetchSubscriptions(recipeInstallId) 
    return {
        statusCode: 200,
        body: JSON.stringify(subscriptions)
    }
}

const checkForSubscriptions = async(recipeInstallId: string, transaction: Transaction): Promise<Subscription | undefined> => {
    const subscriptions = await db.query(SubscriptionTable, "recipeInstallId = :recipeInstallId", {":recipeInstallId": recipeInstallId}) 
    return subscriptions.Items?.find(s  => {
        const sub = s as Subscription
        const date = DateTime.fromJSDate(transaction.transactionDate)
        if (sub.name !== transaction.merchantName) {
            return false
        }
        switch (sub.frequency) {            
            case "MONTHLY": 
                if (date.set({day: sub.day}).diff(date).days > 3 || date.minus({month: 1}).set({day: sub.day}).diff(date).days > 3) {
                    return false
                } 
                break;
            case "WEEKLY": 
                if (Math.abs(date.weekday - sub.weekday) > 2 || Math.abs(date.weekday + 7 - sub.weekday) > 2) {
                    return false
                }            
                break;
            case "YEARLY": 
                if (date.set({day: sub.day}).diff(date).days > 3 || date.minus({month: 1}).set({day: sub.day}).diff(date).days > 3) {
                    return false
                } 
                if (date.month - sub.month > 1) {
                    return false
                }
        }
        return true
    }) as Subscription
}

const fetchSubscriptions = async(recipeInstallId: string) => {
   
    var now = DateTime.now()

    const subscriptionsPromise = db.query(SubscriptionTable, "recipeInstallId = :recipeInstallId", {":recipeInstallId": recipeInstallId})    
    
    const transactionsPromise = db.query(SubscriptionTransactionTable, "recipeInstallId = :recipeInstallId and transactionDate > :transactionDate", {
        ":recipeInstallId": recipeInstallId,
        ":transactionDate": now.set({day:1, month: 1, hour: 0, minute: 0, second: 0, millisecond: 0}).toISO()
    })

    const [subscriptions, transactions] = await Promise.all([subscriptionsPromise, transactionsPromise])
   

    const sorted = subscriptions.Items?.map(s => {
        var nextPayment  = now
        const totalPaid = transactions.Items?.filter(t => t.subscriptionId === s.subscriptionId).reduce((prev, curr) => prev + +curr.amount, 0) ||0
        const m = Months[s.month + ""]
        switch (s.frequency) {
            case "WEEKLY": {
                nextPayment = now.set({weekday: +s.weekday})
                if (nextPayment < now) {
                    nextPayment = nextPayment.plus({week:1})
                }
                break;
            }
            case "MONTHLY": {
                nextPayment = now.set({day: +s.day})
                if (nextPayment < now) {
                    nextPayment = nextPayment.plus({month: 1})
                }
                break;
            } 
            case "YEARLY": {
                nextPayment = now.set({day: +s.day, month: m})
                if (nextPayment < now) {
                    nextPayment = nextPayment.plus({year: 1})
                }
                break;
            }            
        }
        return {nextPayment: nextPayment, totalPaid,  ...(s as Subscription)}            
    }).sort((a, b) => +a.nextPayment - +b.nextPayment)

    return sorted
}

export const refreshHomePanel = async(recipeInstallId: string, token: string) => {
    
    const sorted = await fetchSubscriptions(recipeInstallId)
    
    

    const sumMonth = sorted?.filter(f => f.frequency === "MONTHLY").map(c => c.totalPaid).reduce((prev, current) => prev+current, 0)
    const sumYear = sorted?.filter(f => f.frequency === "YEARLY").map(c => c.totalPaid).reduce((prev, current) => prev+current, 0)

    await Klutch.addPanel(recipeInstallId, "/templates/Home.template", {sumMonth, sumYear, subscriptions: sorted?.slice(0, 2)!!}, null, token)
}
