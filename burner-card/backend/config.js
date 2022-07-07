const throwMissingVariable = (name) => { throw new Error(`missing required env variable "${name}"`) }

const config = {
  mongoUrl: process.env.DATABASE_URL || throwMissingVariable('DATABASE_URL'),
  mongoDbName: process.env.DATABASE_NAME || 'burner-miniapp',
  klutchServerUrl: process.env.KLUTCH_SERVER_URL || throwMissingVariable('KLUTCH_SERVER_URL'),
  klutchPublicKey: process.env.KLUTCH_PUBLIC_KEY || throwMissingVariable('KLUTCH_PUBLIC_KEY'),
  privateKey: process.env.PRIVATE_KEY || throwMissingVariable('PRIVATE_KEY'),
  recipeId: process.env.RECIPE_ID || throwMissingVariable('RECIPE_ID'),
  timeoutSec: parseInt(process.env.TOKEN_TIMEOUT_SEC) || 60,
  recipeInstallCreatedEventType: process.env.RECIPE_INSTALL_EVENT_TYPE || "com.alloycard.core.entities.recipe.RecipeInstallCreatedEvent",
  transactionCreatedEventType: process.env.TRANSACTION_EVENT_TYPE || "com.alloycard.core.entities.transaction.TransactionCreatedEvent",
  port: process.env.PORT || 3002,
  version: process.env.VERSION || "1.1.0",
}

module.exports = { ...config }
