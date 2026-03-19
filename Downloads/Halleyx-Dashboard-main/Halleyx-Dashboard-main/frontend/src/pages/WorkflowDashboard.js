import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./WorkflowDashboard.css"

const API = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/workflows`

function WorkflowDashboard() {
    const [workflows, setWorkflows] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newFlowName, setNewFlowName] = useState("")
    const [newFlowDesc, setNewFlowDesc] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        fetchWorkflows()
    }, [])

    const fetchWorkflows = async () => {
        try {
            setLoading(true)
            const res = await axios.get(API)
            setWorkflows(res.data)
        } catch (e) {
            console.error("Error fetching workflows:", e)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!newFlowName.trim()) return
        try {
            const res = await axios.post(API, {
                name: newFlowName,
                description: newFlowDesc
            })
            setShowCreateModal(false)
            setNewFlowName("")
            setNewFlowDesc("")
            navigate(`/workflows/${res.data._id}`)
        } catch (e) {
            console.error("Failed to create workflow:", e)
        }
    }

    const deleteWorkflow = async (id, e) => {
        e.stopPropagation()
        if (!window.confirm("Are you sure you want to delete this workflow?")) return
        try {
            await axios.delete(`${API}/${id}`)
            fetchWorkflows()
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="page-container workflow-dashboard">
            <div className="page-header" style={{ marginBottom: 40 }}>
                <div className="page-title-group">
                    <h1>Workflows</h1>
                    <p>Automate your business logic with visual rules</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    + Create Workflow
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>
                    Loading workflows...
                </div>
            ) : workflows.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">⚡</div>
                    <h3>No Workflows Yet</h3>
                    <p>Build your first automated workflow to connect data and trigger actions automatically.</p>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        Create Workflow
                    </button>
                </div>
            ) : (
                <div className="workflow-grid">
                    {workflows.map(wf => (
                        <div key={wf._id} className="workflow-card" onClick={() => navigate(`/workflows/${wf._id}`)}>
                            <div className="workflow-card-header">
                                <div className={`status-dot ${wf.status.toLowerCase()}`}></div>
                                <span className="workflow-status">{wf.status}</span>
                                <button className="icon-btn delete-btn" onClick={(e) => deleteWorkflow(wf._id, e)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                            <h3>{wf.name}</h3>
                            <p className="workflow-desc">{wf.description || "No description provided."}</p>
                            
                            <div className="workflow-footer">
                                <span className="trigger-badge">⚡ {wf.trigger?.type || "Manual"}</span>
                                <div className="date-muted">Updated {new Date(wf.updatedAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreateModal(false)}>
                    <div className="modal" style={{ maxWidth: 500 }}>
                        <div className="modal-header">
                            <h3>Create New Workflow</h3>
                            <button className="btn-icon" onClick={() => setShowCreateModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Workflow Name <span className="required">*</span></label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="e.g., Order Processing Pipeline"
                                    value={newFlowName}
                                    onChange={e => setNewFlowName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="form-group" style={{ marginTop: 16 }}>
                                <label className="form-label">Description</label>
                                <textarea 
                                    className="form-control" 
                                    placeholder="What does this workflow do?"
                                    value={newFlowDesc}
                                    onChange={e => setNewFlowDesc(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreate} disabled={!newFlowName.trim()}>
                                Continue to Editor
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default WorkflowDashboard
