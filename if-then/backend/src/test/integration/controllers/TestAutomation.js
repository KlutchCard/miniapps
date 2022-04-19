var assert = require('assert')
const { validate } = require('../../../controllers/Automation')

describe('test automation', () => {
    describe('validate payload', () => {
        it('success', () => {
            const payload = {
                condition: { key: "merchantAmount", title: "Amount Over Then $", value: "0" },
                action: { key: "categorizeTransaction", title: "Categorize Transaction as ", value: "junkie" }
            }
            assert.ok(validate(payload))
        })

        it('fail', () => {
            const payload = { foo: "bar" }
            const valid = validate(payload)
            assert.equal(valid, false)
        })
    })

})
