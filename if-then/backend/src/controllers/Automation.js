const httpStatus = require('http-status');
const Automation = require('../models/Automation');
const { DecodeToken } = require('./helper');
const Ajv = require("ajv")

const ajv = new Ajv()

const validate = ajv.compile({
  type: "object",
  properties: {
    condition: {
      type: "object",
      properties: {
        title: { type: "string" },
        value: { type: "string" },
        key: { type: "string" },
      },
      required: ["title", "value", "key"],
    },
    action: {
      type: "object",
      properties: {
        title: { type: "string" },
        value: { type: "string" },
        key: { type: "string" },
      },
      required: ["title", "value", "key"],
    },
  },
  required: ["condition", "action"],
})

const addAutomation = async (req, resp) => {
  console.log("POST /automation started")

  const valid = validate(req.body)
  if (!valid) {
    return resp.status(httpStatus.BAD_REQUEST).json({ errorMessage: validate.errors })
  }

  const token = req.headers.authorization
  let decodedToken
  try {
    decodedToken = DecodeToken(token.substr(7))
  } catch (err) {
    console.log({ err })
    return resp.status(httpStatus.UNAUTHORIZED).json({ errorMessage: "Invalid token" })
  }

  const recipeInstallId = decodedToken["custom:principalId"]

  try {
    const automation = await Automation.findOne({ recipeInstallId })

    const { rules } = (automation || { _doc: { rules: {} } })._doc

    console.log(`recipeInstall "${recipeInstallId}" has "${Object.keys(rules).length}" rules`)

    const { condition, action } = req.body
    const id = `${condition.key}-${condition.value}`
    rules[id] = { condition, action }

    automation
      ? await Automation.updateOne({ recipeInstallId }, { recipeInstallId, rules })
      : await Automation.create({ recipeInstallId, rules })
  } catch (err) {
    console.log({ err, recipeInstallId })
    return resp.status(httpStatus.SERVICE_UNAVAILABLE).json({ errorMessage: "Database connection error" })
  }

  console.log("POST /automation finished with success")
  return resp.status(httpStatus.CREATED).json()
}

const listAutomation = async (req, resp) => {
  console.log("GET /automation started")
  const token = req.headers.authorization
  let decodedToken
  try {
    decodedToken = DecodeToken(token.substr(7))
  } catch (err) {
    console.log({ err })
    return resp.status(httpStatus.UNAUTHORIZED).json({ errorMessage: "Invalid token" })
  }

  const recipeInstallId = decodedToken["custom:principalId"]

  let automation

  try {
    automation = await Automation.findOne({ recipeInstallId })
  } catch (err) {
    console.log({ err, recipeInstallId })
    return resp.status(httpStatus.SERVICE_UNAVAILABLE).json({ errorMessage: "Database connection error" })
  }

  const { rules } = (automation || { _doc: { rules: {} } })._doc

  console.log(`GET /automation finished with success`)
  return resp.status(httpStatus.OK).json(rules)
}

module.exports = { addAutomation, listAutomation, validate }
