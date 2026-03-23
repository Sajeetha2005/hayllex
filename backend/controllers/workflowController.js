const Workflow = require("../models/Workflow")
const Step = require("../models/Step")
const Rule = require("../models/Rule")
const ExecutionLog = require("../models/ExecutionLog")
const executionEngine = require("../services/executionEngine")

const getWorkflows = async (req, res) => {
    try {
        const workflows = await Workflow.find().sort({ updatedAt: -1 })
        res.json(workflows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const getWorkflow = async (req, res) => {
    try {
        const workflow = await Workflow.findById(req.params.id)
        if (!workflow) return res.status(404).json({ error: "Workflow not found" })
        
        const steps = await Step.find({ workflowId: workflow._id })
        const rules = await Rule.find({ workflowId: workflow._id })

        res.json({ workflow, steps, rules })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const createWorkflow = async (req, res) => {
    try {
        const workflow = new Workflow(req.body)
        await workflow.save()
        res.status(201).json(workflow)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const updateWorkflow = async (req, res) => {
    try {
        req.body.updatedAt = Date.now()
        const workflow = await Workflow.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.json(workflow)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const deleteWorkflow = async (req, res) => {
    try {
        await Workflow.findByIdAndDelete(req.params.id)
        await Step.deleteMany({ workflowId: req.params.id })
        await Rule.deleteMany({ workflowId: req.params.id })
        res.json({ message: "Workflow deleted" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const saveWorkflowState = async (req, res) => {
    const startTime = Date.now();
    try {
        const { id } = req.params
        const { steps, rules } = req.body

        console.log(`Saving workflow ${id} with ${steps.length} steps and ${rules.length} rules...`);

        // Use simpler approach for better reliability
        // Delete existing steps and rules
        await Step.deleteMany({ workflowId: id })
        await Rule.deleteMany({ workflowId: id })

        // Save new steps
        const stepMap = {}
        const createdSteps = await Promise.all(steps.map(s => {
            const stepId = s._id ? s._id : undefined
            delete s._id
            if (!s.position || typeof s.position.x !== "number" || typeof s.position.y !== "number") {
                s.position = { x: 0, y: 0 }
            }
            const step = new Step({ ...s, workflowId: id })
            stepMap[s.id || stepId] = step._id
            return step.save()
        }))

        // Update step nextSteps with real ObjectIds
        for (let s of steps) {
            if (s.nextSteps && s.nextSteps.length > 0) {
                const stepDoc = createdSteps.find(c => c._id.toString() === stepMap[s.id || s._id].toString())
                stepDoc.nextSteps = s.nextSteps.map(nId => stepMap[nId])
                await stepDoc.save()
            }
        }

        // Save active rules
        if (rules && rules.length > 0) {
            await Promise.all(rules.map(r => {
                const rule = new Rule({ 
                    ...r, 
                    workflowId: id,
                    stepId: stepMap[r.stepId] || r.stepId,
                    onTrueStepId: stepMap[r.onTrueStepId] || r.onTrueStepId,
                    onFalseStepId: stepMap[r.onFalseStepId] || r.onFalseStepId
                })
                return rule.save()
            }))
        }

        const endTime = Date.now()
        console.log(`Workflow saved in ${endTime - startTime}ms`)

        res.json({ message: "Workflow state saved", steps: steps.length, rules: rules.length })
    } catch (err) {
        console.error("Save workflow state error:", err)
        res.status(500).json({ error: err.message })
    }
}

const executeWorkflow = async (req, res) => {
    try {
        const { id } = req.params
        const initialPayload = req.body

        const workflow = await Workflow.findById(id)
        if (!workflow) return res.status(404).json({ error: "Workflow not found" })

        const logId = await executionEngine.startExecution(id, initialPayload, "Manual API Call")
        res.json({ message: "Workflow execution started", logId })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const getExecutionLogs = async (req, res) => {
    try {
        const logs = await ExecutionLog.find().sort({ startTime: -1 }).limit(50)
        res.json(logs)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const getExecutionLog = async (req, res) => {
    try {
        const log = await ExecutionLog.findById(req.params.logId).populate("workflowId")
        res.json(log)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

module.exports = {
    getWorkflows,
    getWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    saveWorkflowState,
    executeWorkflow,
    getExecutionLogs,
    getExecutionLog
}
