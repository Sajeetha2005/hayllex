import React, { useState, useEffect } from "react"
import axios from "axios"
import "./ExecutionLogs.css"

const API = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/workflows/logs`

function ExecutionLogs() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedLog, setExpandedLog] = useState(null)

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        try {
            setLoading(true)
            const res = await axios.get(API)
            setLogs(res.data)
        } catch (e) {
            console.error("Failed to fetch logs", e)
        } finally {
            setLoading(false)
        }
    }

    const toggleExpand = async (logId) => {
        if (expandedLog?.id === logId) {
            setExpandedLog(null)
            return
        }

        try {
            const res = await axios.get(`${API}/${logId}`)
            setExpandedLog({ id: logId, data: res.data })
        } catch (err) {
            console.error(err)
        }
    }

    const formatDuration = (start, end) => {
        if (!start || !end) return "-"
        const ms = new Date(end) - new Date(start)
        return `${ms}ms`
    }

    return (
        <div className="page-container execution-logs-page">
            <div className="page-header" style={{ marginBottom: 32 }}>
                <div className="page-title-group">
                    <h1>Execution History</h1>
                    <p>Track performance and debug automated workflows</p>
                </div>
                <button className="btn btn-secondary" onClick={fetchLogs}>
                    ↻ Refresh
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>
                    Loading logs...
                </div>
            ) : logs.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3>No Executions Yet</h3>
                    <p>Run a workflow to generate execution logs.</p>
                </div>
            ) : (
                <div className="logs-container">
                    {logs.map(log => (
                        <div key={log._id} className={`log-card ${log.status.toLowerCase()}`}>
                            <div className="log-summary" onClick={() => toggleExpand(log._id)}>
                                <div className="log-status-indicator">
                                    {log.status === "Success" || log.status === "Completed" ? "✅" : log.status === "Failed" ? "❌" : "⏳"}
                                </div>
                                <div className="log-info">
                                    <div className="log-workflow-id">Execution: {log._id}</div>
                                    <div className="log-meta">
                                        <span>Time: {new Date(log.startTime).toLocaleString()}</span>
                                        <span className="separator">•</span>
                                        <span>Trigger: {log.triggeredBy}</span>
                                        <span className="separator">•</span>
                                        <span>Duration: {formatDuration(log.startTime, log.endTime)}</span>
                                    </div>
                                </div>
                                <div className="log-expand-icon">
                                    {expandedLog?.id === log._id ? "▲" : "▼"}
                                </div>
                            </div>

                            {expandedLog?.id === log._id && expandedLog.data && (
                                <div className="log-details-dropdown">
                                    <div className="log-steps-timeline">
                                        {expandedLog.data.steps.map((step, idx) => (
                                            <div key={idx} className={`timeline-step ${step.status.toLowerCase()}`}>
                                                <div className="step-indicator"></div>
                                                <div className="step-content">
                                                    <div className="step-header">
                                                        <strong>{step.name}</strong>
                                                        <span className="step-duration">{formatDuration(step.startTime, step.endTime)}</span>
                                                    </div>
                                                    
                                                    {step.error && (
                                                        <div className="step-error-box">
                                                            {step.error}
                                                        </div>
                                                    )}
                                                    
                                                    <div className="step-data-preview">
                                                        <span className="data-title">Input:</span>
                                                        <code>{JSON.stringify(step.inputData, null, 2)}</code>
                                                    </div>
                                                    {step.outputData && (
                                                        <div className="step-data-preview mt-2">
                                                            <span className="data-title">Output:</span>
                                                            <code>{JSON.stringify(step.outputData, null, 2)}</code>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ExecutionLogs
