const mongoose = require("mongoose")

const StepSchema = new mongoose.Schema({
    workflowId: { type: mongoose.Schema.Types.ObjectId, ref: "Workflow", required: true },
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ["Trigger", "Action", "Condition", "Filter", "Delay", "End"],
        required: true
    },
    config: { type: Object, default: {} }, // Action details, e.g., API URL, email template
    position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 }
    }, // For the ReactFlow UI
    nextSteps: [{ type: mongoose.Schema.Types.ObjectId, ref: "Step" }], // For linear/success paths
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Step", StepSchema)
