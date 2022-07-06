import KlutchJS, { GraphQLService, RecipePanel, RecipePanelSize, RecipesService } from "@klutch-card/klutch-js"
import {KMS}  from "aws-sdk"
import base64url from "base64url";



export default new class Klutch {

    private recipeId = process.env.recipeId   
    private keyId = process.env.klutchKey || ""

    private KMS = new KMS({region: process.env.AWS_REGION})
    private serverUrl = process.env.klutchServerUrl || ""



    constructor() {
        KlutchJS.configure({
            serverUrl: this.serverUrl
        })
    }
    

    private async buildJWT() {
        const header = {
            "alg": "RS256",
            "typ": "JWT",
            "kid": `AlloyPrincipal-${this.recipeId}` 
          }
    
        const payload = {
            exp:  Math.floor(Date.now() / 1000) + 60,
            iat: Math.floor(Date.now() / 1000),
            iss: "AlloyCard",
            "custom:principalId": this.recipeId,
            "custom:principalType": "com.alloycard.core.entities.recipe.Recipe"
        }
    
        let token_components = {
            header: base64url(JSON.stringify(header)),
            payload: base64url(JSON.stringify(payload)),
            signature: ""
        };
    
        let message = Buffer.from(token_components.header + "." + token_components.payload)
        
                
        let res = await this.KMS.sign({
            Message: message,
            KeyId: this.keyId,
            SigningAlgorithm: 'RSASSA_PKCS1_V1_5_SHA_256',
            MessageType: 'RAW'
        }).promise()

        token_components.signature = res.Signature?.toString("base64").replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '') || ""    
        return token_components.header + "." + token_components.payload + "." + token_components.signature;    
    }

    async auth(recipeInstallId: string): Promise<string> {
        try {
            const recipeKey = await this.buildJWT()
            GraphQLService.setAuthToken(recipeKey)
            const recipeInstallJWT = await RecipesService.getRecipeInstallToken(recipeInstallId)
            GraphQLService.setAuthToken(recipeInstallJWT)    
            return recipeInstallJWT
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    async addPanel(recipeInstallId: string, templateFileName: string, data: Object, entity: any, jwt: string, size: RecipePanelSize): Promise<RecipePanel>  {
        GraphQLService.setAuthToken(jwt)
        return await RecipesService.addPanel(recipeInstallId, templateFileName, data, entity, undefined, size)
    }

}