const Workflow = require("../models/Workflow")
const Step = require("../models/Step")
const Rule = require("../models/Rule")
const ExecutionLog = require("../models/ExecutionLog")
const RuleEngine = require("./ruleEngine")

class ExecutionEngine {
    constructor() {
        this.activeExecutions = new Map() // logId -> currentStepId
    }

    async startExecution(workflowId, initialPayload = {}, triggeredBy = "System") {
        const workflow = await Workflow.findById(workflowId)
        if (!workflow) throw new Error("Workflow not found")

        const steps = await Step.find({ workflowId })
        const rules = await Rule.find({ workflowId })

        if (steps.length === 0) throw new Error("Workflow has no steps")

        // Find Trigger step (usually the starting point)
        const startStep = steps.find(s => s.type === "Trigger") || steps[0]

        // Create Execution Log
        const log = new ExecutionLog({
            workflowId,
            status: "Running",
            initialPayload,
            triggeredBy,
            steps: []
        })
        await log.save()

        // Offload execution to run asynchronously
        this.runWorkflow(log._id, workflow, steps, rules, startStep, initialPayload).catch(err => {
            console.error(`Workflow execution failed for ${log._id}`, err)
        })

        return log._id
    }

    async runWorkflow(logId, workflow, steps, rules, startStep, payload) {
        let currentStepId = startStep._id
        let currentPayload = { ...payload }
        const ruleEngine = new RuleEngine(rules)
        let executionStatus = "Completed"

        try {
            while (currentStepId) {
                const step = steps.find(s => s._id.toString() === currentStepId.toString())
                if (!step) {
                    console.error(`Step not found: ${currentStepId}`)
                    break
                }

                // Log step start
                let stepLog = {
                    stepId: step._id,
                    name: step.name,
                    status: "Running",
                    startTime: new Date(),
                    inputData: { ...currentPayload }
                }

                // Execute the step logic
                try {
                    console.log(`Executing step: ${step.name} (${step.type})`)
                    currentPayload = await this.executeStep(step, currentPayload)
                    stepLog.status = "Success"
                    stepLog.outputData = { ...currentPayload }
                    console.log(`Step ${step.name} completed successfully`)
                } catch (err) {
                    console.error(`Step ${step.name} failed:`, err)
                    stepLog.status = "Failed"
                    stepLog.error = err.message
                    executionStatus = "Failed"
                }

                stepLog.endTime = new Date()

                // Update Execution Log in DB
                await ExecutionLog.findByIdAndUpdate(logId, {
                    $push: { steps: stepLog }
                })

                if (stepLog.status === "Failed") break

                // Determine next step based on Rules and NextSteps array
                let nextStepId = ruleEngine.getNextStepFromRules(step._id, currentPayload)
                
                // If no rule matches, or no rules exist, just take the first default next step
                if (!nextStepId && step.nextSteps && step.nextSteps.length > 0) {
                    nextStepId = step.nextSteps[0]
                }

                currentStepId = nextStepId // continue loop or break if null
            }

            // Mark workflow completed
            await ExecutionLog.findByIdAndUpdate(logId, {
                status: executionStatus,
                endTime: new Date(),
                finalPayload: currentPayload
            })
            
            console.log(`Workflow execution ${executionStatus.toLowerCase()} for logId: ${logId}`)

        } catch (err) {
            console.error(`Workflow execution failed for ${logId}:`, err)
            await ExecutionLog.findByIdAndUpdate(logId, {
                status: "Failed",
                endTime: new Date(),
                finalPayload: currentPayload,
                $push: {
                    steps: { name: "System Error", status: "Failed", error: err.message }
                }
            })
        }
    }

    /**
     * Executes the actual logic of a single step
     * @param {Object} step The step document
     * @param {Object} payload The data payload passing through
     * @returns {Object} transformed payload
     */
    async executeStep(step, payload) {
        return new Promise((resolve, reject) => {
            switch (step.type) {
                case "Trigger": 
                    // Usually just passes data through
                    resolve(payload)
                    break
                case "Filter":
                    // Filters the data or adds a flag
                    payload._filtered = true
                    resolve(payload)
                    break
                case "Action":
                    // E.g., Send Email, Make API call
                    if (step.config && step.config.action === "Add Field") {
                        payload[step.config.fieldName || "newField"] = step.config.fieldValue || "Success"
                    }
                    resolve(payload)
                    break
                case "Delay":
                    const ms = step.config ? Number(step.config.ms) || 1000 : 1000
                    setTimeout(() => resolve(payload), ms)
                    break 
                case "Condition":
                    // Handled mostly by Rule engine, passes through
                    resolve(payload)
                    break
                case "End":
                    resolve(payload)
                    break
                default: 
                    resolve(payload)
            }
        })
    }
}

module.exports = new ExecutionEngine()
