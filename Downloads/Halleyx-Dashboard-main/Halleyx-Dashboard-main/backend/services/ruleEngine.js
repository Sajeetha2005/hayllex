const _ = require("lodash")

class RuleEngine {
    constructor(rules) {
        this.rules = rules || []
    }

    /**
     * Evaluates a payload against a set of given rule conditions
     * @param {Object} payload Current workflow data state
     * @param {Array} conditions Array of condition objects
     * @param {String} logicalOperator AND / OR
     * @returns {Boolean} True if rule passes, false otherwise
     */
    evaluateCondition(payload, conditions, logicalOperator = "AND") {
        if (!conditions || conditions.length === 0) return true

        const evaluations = conditions.map(cond => {
            const actualValue = _.get(payload, cond.field)
            const expectedValue = cond.value

            switch (cond.operator) {
                case "==": return actualValue == expectedValue
                case "!=": return actualValue != expectedValue
                case ">": return Number(actualValue) > Number(expectedValue)
                case "<": return Number(actualValue) < Number(expectedValue)
                case ">=": return Number(actualValue) >= Number(expectedValue)
                case "<=": return Number(actualValue) <= Number(expectedValue)
                case "contains": 
                    if (typeof actualValue === "string") return actualValue.includes(String(expectedValue))
                    if (Array.isArray(actualValue)) return actualValue.includes(expectedValue)
                    return false
                default: return false
            }
        })

        if (logicalOperator === "AND") {
            return evaluations.every(Boolean)
        } else {
            return evaluations.some(Boolean)
        }
    }

    /**
     * Finds the next step ID based on rules attached to the current step
     * @param {String} stepId The current step ID
     * @param {Object} payload The data payload
     * @returns {String|null} The next step ID or null if no rules match
     */
    getNextStepFromRules(stepId, payload) {
        const stepRules = this.rules.filter(r => r.stepId.toString() === stepId.toString())
        if (stepRules.length === 0) return null

        for (const rule of stepRules) {
            const isMatch = this.evaluateCondition(payload, rule.conditions, rule.logicalOperator)
            if (isMatch && rule.onTrueStepId) {
                return rule.onTrueStepId
            }
            if (!isMatch && rule.onFalseStepId) {
                return rule.onFalseStepId
            }
        }

        return null
    }
}

module.exports = RuleEngine
