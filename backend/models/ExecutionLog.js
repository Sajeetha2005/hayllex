const mongoose = require("mongoose")

const ExecutionLogSchema = new mongoose.Schema({
    workflowId: { type: mongoose.Schema.Types.ObjectId, ref: "Workflow", required: true },
    status: { type: String, enum: ["Pending", "Running", "Completed", "Failed"], default: "Pending" },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    triggeredBy: { type: String, default: "Manual" }, // E.g., user ID or webhook
    initialPayload: { type: Object, default: {} }, // Payload that started the workflow
    finalPayload: { type: Object, default: {} }, // Output payload
    steps: [
        {
            stepId: { type: mongoose.Schema.Types.ObjectId, ref: "Step" },
            name: { type: String },
            status: { type: String, enum: ["Pending", "Running", "Success", "Failed", "Skipped"] },
            startTime: { type: Date },
            endTime: { type: Date },
            inputData: { type: Object },
            outputData: { type: Object },
            error: { type: String }
        }
    ]
})

module.exports = mongoose.model("ExecutionLog", ExecutionLogSchema)
