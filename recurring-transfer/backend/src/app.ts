import { TransferService, AccountService, GraphQLService, RecipesService } from "@klutch-card/klutch-js";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import Klutch from "./klutch.js";

import {RecurringTransfer} from "./recurringtransfer"


var {DateTime} = require('luxon')
const dynamo = require('./dynamo.js')


export const processTransfers = async () => {
    const weekday = DateTime.now().weekday
    const dayOfMonth = DateTime.now().day

    const tablename = process.env.RecurringTableName

    const data = await dynamo.scan(tablename)
    const transfers = data.Items

    for (let t of transfers) {
        if ((t.type == "weekly" && t.day == weekday) || (t.type == "monthly" && t.day == dayOfMonth))  {
            console.log("Transfering for user", t)
            const jwt = await Klutch.auth(t.recipeInstallId)
            await Klutch.startTransfer(t.transferSourceId, t.amount, jwt)
            return;
        }
    }
}


export const lowBalanceWebhook = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>  => {
    if (!event.body) {
        return {
            statusCode: 400,
            body: "Body cannot be null"   
        }
    } 

    const alloyEvent = JSON.parse(event.body)
    console.log("New Message:", JSON.stringify(alloyEvent))
    
    const tablename = process.env.RecurringTableName
    const recipeId = process.env.recipeId || ""

    if (alloyEvent.event._alloyCardType == "com.alloycard.core.entities.account.AccountBalanceChangedEvent" ) {
        const recipeInstallId = alloyEvent.principal.entityID  
        
        const recurring = await dynamo.query(tablename, recipeInstallId)
        if (!recurring || recurring.length == 0) {
            return {
                statusCode: 200,
                body: "{}"   
            } 
        }
        var constRec = recurring.Items.filter((c: RecurringTransfer) => c.type == "lowbalance").reduce((prev:RecurringTransfer, cur: RecurringTransfer) => prev.lowbalanceAmount!! > cur.lowbalanceAmount!! ? prev : cur, {})

        if (!constRec.lowbalanceAmount) {
            return {
                statusCode: 200,
                body: "{}"   
            } 
        }
        const jwt = await Klutch.auth(recipeInstallId)
        GraphQLService.setAuthToken(jwt)

        const balance = (await RecipesService.getAccountFromRecipeInstall(recipeId, recipeInstallId)).revolvingLoan?.balance || 0
        
        const transfers = await TransferService.listTransfers()

        var pendingTransferAmount = transfers
            .filter(x => x.status == "PENDING" || x.status == "PROCESSING" || x.status == "WAITING_RELEASE")
            .map(c => c.amount)
            .reduce((prev, curr) => prev + curr, 0)
        
        
        
        if (balance + pendingTransferAmount <= constRec.lowbalanceAmount) {            
            await TransferService.createTransfer(constRec.transferSourceId, constRec.amount)
            console.log("Added transfer")
        }
        
        console.log("Finished")
    }
    return {
        statusCode: 200,
        body: JSON.stringify("{}")
    }    

}