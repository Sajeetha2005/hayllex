const express = require("express")
const router = express.Router()
const {
    getWorkflows,
    getWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    saveWorkflowState,
    executeWorkflow,
    getExecutionLogs,
    getExecutionLog
} = require("../controllers/workflowController")

router.get("/", getWorkflows)
router.post("/", createWorkflow)
router.get("/logs", getExecutionLogs)
router.get("/logs/:logId", getExecutionLog)

router.get("/:id", getWorkflow)
router.put("/:id", updateWorkflow)
router.delete("/:id", deleteWorkflow)

router.put("/:id/state", saveWorkflowState)
router.post("/:id/execute", executeWorkflow)


module.exports = router
