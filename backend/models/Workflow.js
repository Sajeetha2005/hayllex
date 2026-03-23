const mongoose = require("mongoose")

const WorkflowSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["Draft", "Active", "Archived"], default: "Draft" },
    trigger: {
        type: { type: String, enum: ["Manual", "Scheduled", "Webhook"], default: "Manual" },
        config: { type: Object, default: {} } // E.g., cron schedule or webhook URL
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Workflow", WorkflowSchema)
