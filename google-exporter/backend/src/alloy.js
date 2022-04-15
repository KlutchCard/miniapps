
const base64url = require("base64url");

const AlloyJS = require("@klutch-card/klutch-js") 

const {KMS} =  require('aws-sdk')    

const kms = new KMS({region:  process.env.AWS_REGION})



AlloyJS.configure({
    serverUrl: process.env.klutchServerUrl
})

async function buildAlloyJWT(recipeId, keyId) {
    const header = {
        "alg": "RS256",
        "typ": "JWT",
        "kid": `AlloyPrincipal-${recipeId}` 
      }

    const payload = {
        exp:  Math.floor(Date.now() / 1000) + 60,
        iat: Math.floor(Date.now() / 1000),
        iss: "AlloyCard",
        "custom:principalId": recipeId,
        "custom:principalType": "com.alloycard.core.entities.recipe.Recipe"
    }

    let token_components = {
        header: base64url(JSON.stringify(header)),
        payload: base64url(JSON.stringify(payload)),
    };

    let message = Buffer.from(token_components.header + "." + token_components.payload)

    
    let res = await kms.sign({
        Message: message,
        KeyId: keyId,
        SigningAlgorithm: 'RSASSA_PKCS1_V1_5_SHA_256',
        MessageType: 'RAW'
    }).promise()

    token_components.signature = res.Signature.toString("base64").replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return token_components.header + "." + token_components.payload + "." + token_components.signature;    
}

exports.setAuthForRecipeInstall = async (alloyKey, recipeId, recipeInstallId) => {
    const recipeKey = await buildAlloyJWT(recipeId, alloyKey)
    AlloyJS.GraphQLService.setAuthToken(recipeKey)    
    const recipeInstallJWT = await AlloyJS.RecipesService.getRecipeInstallToken(recipeInstallId)
    AlloyJS.GraphQLService.setAuthToken(recipeInstallJWT)    
}


exports.setRecipeInstallConfig = async (alloyKey, recipeId, recipeInstallId, configs)  => {
    await this.setAuthForRecipeInstall(alloyKey, recipeId, recipeInstallId)
    const changeData = await AlloyJS.RecipesService.changeRecipeInstallConfig(recipeInstallId, configs)
    return changeData
}

exports.getTransactionDetails = async (alloyKey, recipeId, recipeInstallId, transactionId) => {
    await this.setAuthForRecipeInstall(alloyKey, recipeId, recipeInstallId)
    return await AlloyJS.TransactionService.getTransactionDetails(transactionId)
}

exports.getAllTransactions = async (alloyKey, recipeId, recipeInstallId) => {
    await this.setAuthForRecipeInstall(alloyKey, recipeId, recipeInstallId)
    return await AlloyJS.TransactionService.getAllTransactions()
}

exports.addTransactionPanel = async (alloyKey, recipeId, recipeInstallId, template, data, transactionId) => {
    await this.setAuthForRecipeInstall(alloyKey, recipeId, recipeInstallId)
    return await AlloyJS.RecipesService.addPanel(recipeInstallId, template, data, {entityID: transactionId, type: "com.alloycard.core.entities.transaction.Transaction"})
    
}


