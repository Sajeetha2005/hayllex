const mongoose = require("mongoose")

const RuleSchema = new mongoose.Schema({
    workflowId: { type: mongoose.Schema.Types.ObjectId, ref: "Workflow", required: true },
    stepId: { type: mongoose.Schema.Types.ObjectId, ref: "Step", required: true },
    name: { type: String, required: true },
    conditions: [
        {
            field: { type: String, required: true }, // E.g., payload.amount
            operator: { type: String, enum: ["==", "!=", ">", "<", ">=", "<=", "contains"], required: true },
            value: { type: mongoose.Schema.Types.Mixed, required: true }
        }
    ],
    logicalOperator: { type: String, enum: ["AND", "OR"], default: "AND" },
    onTrueStepId: { type: mongoose.Schema.Types.ObjectId, ref: "Step" }, // Step to run if rule matches
    onFalseStepId: { type: mongoose.Schema.Types.ObjectId, ref: "Step" }, // Step to run if rule fails
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Rule", RuleSchema)
