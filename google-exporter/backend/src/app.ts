import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import {SecretsManager} from "aws-sdk"
import { setImmediate } from "timers";
import {Transaction, TransactionStatus} from "@klutch-card/klutch-js"


const axios = require('axios').default;
const sheets = require('./sheets.js');
const dynamo = require('./dynamo.js')
const alloy = require('./alloy.js');

const {DateTime} = require('luxon');

const secretManager = new SecretsManager({region: process.env.AWS_REGION});


export const handleWebhook = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {    

    

    if (!event.body) {
        return {
            statusCode: 400,
            body: "Body cannot be null"   
        }
    }    
    
    const alloyEvent = JSON.parse(event.body)
    console.log("New Message:", JSON.stringify(alloyEvent))

    const alloyKey = process.env.klutchKey
    const recipeId = process.env.recipeId
    const tableName = process.env.AccessTokenTable
    const secret = JSON.parse(await getSecret("/google/oauth"))
    const client_id = secret.client_id
    const client_secret = secret.client_secret

    
    if (alloyEvent.event._alloyCardType == "com.alloycard.core.entities.transaction.TransactionCreatedEvent" || 
        alloyEvent.event._alloyCardType == "com.alloycard.core.entities.transaction.TransactionUpdatedEvent") {
        const recipeInstallId = alloyEvent.principal.entityID        
        const t: Transaction = await alloy.getTransactionDetails(alloyKey, recipeId, recipeInstallId, alloyEvent.event.transaction.entityID)

        const googleCredentials = await dynamo.findById(tableName, recipeInstallId)
        const params = new URLSearchParams()
        params.append('client_id',client_id)
        params.append('client_secret',client_secret)
        params.append('grant_type',"refresh_token")
        params.append('refresh_token', googleCredentials.Item.refresh_token)
    
    
        try {
            const resp = await axios.post('https://oauth2.googleapis.com/token', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }); 

            const row = {Id: t.id,
                Date: DateTime.fromJSDate(t.transactionDate).toLocaleString(DateTime.DATETIME_SHORT, {timeZone: "America/Los_Angeles"}),
                Card:  t.card?.name || "",
                Merchant: t.merchantName,
                Amount: t.amount,
                Category: t.category?.name || "",
                Type: t.transactionType,
                Status: t.transactionStatus,
                Street: t.streetAddress,
                City: t.city,
                State: t.state,
                "Zip Code": t.zipCode
            }
            const currentRows = await sheets.findLines(resp.data, googleCredentials.Item.sheetId)
            //check insert or update
            const line = currentRows.find((r: any) => r.Id == t.id) 
            if (line) {
                await sheets.updateLine(resp.data, googleCredentials.Item.sheetId, line, row)
            } else {
                const sheetRow = await sheets.insertLine(resp.data, googleCredentials.Item.sheetId, row)
                await alloy.addTransactionPanel(alloyKey, recipeId, recipeInstallId, "/templates/Transaction.template", {transaction: t, ...sheetRow}, t.id)        
            }
            return {
                statusCode: 200,
                body: "{}"
            }    
        } catch (e) {
            console.error(e)
        }        
    }
    return {
        statusCode: 200,
        body: "{}"
    }    
}

const getSecret =  async(secretName: string): Promise<string> => {
    return new Promise((res, rej) => {
        secretManager.getSecretValue({SecretId: secretName}, function(err, data) {
            if (err) {
                rej(err)
            }
            else {
                res(data.SecretString as string)
            }
        });
    })
}

export const oauthRedirect = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> =>  {    
    const secret = JSON.parse(await getSecret("/google/oauth"))
    const client_id = secret.client_id
    const client_secret = secret.client_secret

    const tableName = process.env.AccessTokenTable
    const recipeId = process.env.recipeId
    const alloyKey = process.env.klutchKey



    if (!event.queryStringParameters) {
        return {
            statusCode: 500,
            body: "QueryString params are null"            
        }
    }

    const redirect_uri = `https://${event.headers.host}/oauth-redirect`
    const code = event.queryStringParameters["code"] || ""
    const state = JSON.parse(event.queryStringParameters["state"] || "")

    const params = new URLSearchParams()
    params.append('client_id',client_id)
    params.append('client_secret',client_secret)
    params.append('code',code)
    params.append('grant_type',"authorization_code")
    params.append('redirect_uri', redirect_uri)



    const resp = await axios.post('https://oauth2.googleapis.com/token', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });   

    const headers = ["Id", "Date", "Card",  "Merchant", "Amount", "Category", "Type", "Status", "Street", "City", "State", "Zip Code"]

    const sheet = await sheets.createSheet(resp.data, state.sheetName, headers)


    if (resp.data.refresh_token) {
        const toInsert = {id: state.recipeInstallId,  sheetId: sheet.spreadsheetId,   ...resp.data}
        await dynamo.insert(tableName, toInsert)     
    } else {
        const googleCredentials = await dynamo.findById(tableName, state.recipeInstallId)
        const toInsert = {id: state.recipeInstallId,  sheetId: sheet.spreadsheetId,   ...googleCredentials.Item}
        await dynamo.insert(tableName, toInsert )     
    }
    
    

    var transactions: Transaction[] = await alloy.getAllTransactions(alloyKey, recipeId, state.recipeInstallId)
    
    transactions = transactions.filter(t => t.transactionStatus == TransactionStatus.SETLLED).sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime())

    const newSheet = sheet.sheetsByIndex[0]
    var rows = []
    for (let t of transactions) {
        try {
            rows.push([DateTime.fromJSDate(t.transactionDate).toLocaleString(DateTime.DATETIME_SHORT, {timeZone: "America/Los_Angeles"}), t.card?.name || "", t.merchantName, t.amount, t.category?.name || "", t.transactionType, t.transactionStatus, t.streetAddress, t.city, t.state, t.zipCode]) 
        } catch (e) {
            console.error("ERROR", e)
        }
    }
    await newSheet.addRows(rows)
    await newSheet.saveUpdatedCells()

    const redirectUrl = `klutch://klutch/miniapps/${recipeId}/templates/Connected.template`
    console.log("Redirecting to: " + redirectUrl)
    return {
        'statusCode': 301,
        body: "redirecting...",
        headers: {
            Location: redirectUrl
        }
    }
}

