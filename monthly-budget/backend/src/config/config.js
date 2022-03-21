require('dotenv').config({ path: ".env" })
const throwMissingVariable = (name) => { throw new Error(`missing required env variable "${name}"`) }

module.exports = {
  klutchServerUrl: process.env.KLUTCH_SERVER_URL || throwMissingVariable('KLUTCH_SERVER_URL'),
  klutchPublicKey: process.env.KLUTCH_PUBLIC_KEY || throwMissingVariable('KLUTCH_PUBLIC_KEY'),
  port: process.env.PORT || 3002,
  database: {
    dialect: process.env.DATABASE_DIALECT || 'mysql',
    database: process.env.DATABASE_NAME || throwMissingVariable('DATABASE_NAME'),
    host: process.env.DATABASE_HOST || throwMissingVariable('DATABASE_HOST'),
    username: process.env.DATABASE_USERNAME || throwMissingVariable('DATABASE_USERNAME'),
    password: process.env.DATABASE_PASSWORD || throwMissingVariable('DATABASE_PASSWORD'),
  },
  recipeId: process.env.RECIPE_ID || throwMissingVariable('RECIPE_ID'),
  privateKey: process.env.RECIPE_PRIVATE_KEY || throwMissingVariable('RECIPE_PRIVATE_KEY'),
  version: process.env.APP_VERSION || '1.2.0',
}
