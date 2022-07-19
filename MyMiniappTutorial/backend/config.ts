const PORT = 3004
const SERVER_URL = "https://sandbox.klutchcard.com"
const RECIPEINSTALL_CREATED_EVENT = "com.alloycard.core.entities.recipe.RecipeInstallCreatedEvent"
const TRANSACTION_CREATED_EVENT = "com.alloycard.core.entities.transaction.TransactionCreatedEvent"
const RECIPE_ID = "2604e724-8805-4a30-baa9-5819399eb903"
const PRIVATE_KEY = process.env.PRIVATE_KEY
const KLUTCH_PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA68vuDInRI2B9gJsoYQfk\nC+7LyLjiye7iyOACXjCHGXF3yyYhTj8aKp5x6EDZHSupnuLd2kaNoWfu5oMHP1Nm\noU0Sx6z40cuO4fDk1SVswl+Ptv10L9zQjfhVaog9DbyKB9nCyIf9fYsphIQtpWfu\n3MkXgvvUKUR41hJOkM2d6jpH7k3wrgFfztGxTiDLAtb3HZk+QU2V0C6VBB6Uev/8\noZuG6GH8bwGCr68rTrUaDzD5MgVtLv9c7em+ZxXuSS1eS1thkCZaHnjoD2AjvheK\nDDFbFzAribqyPE+BFxhy8bLuAnQodQ1eISCel3AOsPzLHROtKIODmVVVBSZL27RV\nzwIDAQAB\n-----END PUBLIC KEY-----"
const TIMEOUT_SEC = 30

export {
    PORT,
    SERVER_URL,
    RECIPEINSTALL_CREATED_EVENT,
    TRANSACTION_CREATED_EVENT,
    RECIPE_ID,
    PRIVATE_KEY,
    KLUTCH_PUBLIC_KEY,
    TIMEOUT_SEC,
}
