import { KLUTCH_PUBLIC_KEY, PRIVATE_KEY, RECIPE_ID, TIMEOUT_SEC } from "./config"
import { sign, verify } from 'jsonwebtoken'

const BuildJWTToken = (): string => {
  const header = { algorithm: "RS256", keyid: `AlloyPrincipal-${RECIPE_ID}` }
  const payload = {
    exp: Math.floor(Date.now() / 1000) + TIMEOUT_SEC,
    iat: Math.floor(Date.now() / 1000),
    iss: "AlloyCard",
    "custom:principalId": RECIPE_ID,
    "custom:principalType": "com.alloycard.core.entities.recipe.Recipe"
  }

  return sign(payload, PRIVATE_KEY, header)
}

const DecodeToken = (jwtToken: string) => verify(jwtToken, KLUTCH_PUBLIC_KEY, { algorithms: ["RS256"] })

export { BuildJWTToken, DecodeToken }
