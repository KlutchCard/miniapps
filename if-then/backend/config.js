const throwMissingVariable = (name) => { throw new Error(`missing required env variable "${name}"`) }

const config = {
  klutchServerUrl: process.env.KLUTCH_SERVER_URL || throwMissingVariable('KLUTCH_SERVER_URL'),
  mongoUrl: process.env.DATABASE_URL || throwMissingVariable('DATABASE_URL'),
  privateKeyPath: process.env.PRIVATE_KEY || process.env.PATH_PRIVATE_KEY || throwMissingVariable('PATH_PRIVATE_KEY'),
  klutchKeyPath: process.env.KLUTCH_PUBLIC_KEY || process.env.PATH_KLUTCH_PUBLIC_KEY || throwMissingVariable('PATH_KLUTCH_PUBLIC_KEY'),
  recipeId: process.env.RECIPE_ID || 'IfThen',
  timeoutSec: parseInt(process.env.TOKEN_TIMEOUT_SEC) || 60,
  transactionEventType: process.env.TRANSACTION_EVENT_TYPE || "com.alloycard.core.entities.transaction.TransactionCreatedEvent",
  mongoDbName: process.env.MONGODB_NAME || throwMissingVariable('MONGODB_NAME'),
  port: process.env.PORT || 3000,
  version: process.env.APP_VERSION || '1.1.4',
}

module.exports = { ...config }
