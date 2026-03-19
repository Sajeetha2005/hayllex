import React, { useState, useEffect } from "react"
import "./StepConfigPanel.css"

const STEP_TYPES = ["Trigger", "Action", "Condition", "Filter", "Delay", "End"]
const OPERATORS = ["==", "!=", ">", "<", ">=", "<=", "contains"]

function StepConfigPanel({ node, rules, onSaveNode, onSaveRules, onClose }) {
    const [config, setConfig] = useState({})
    const [localRules, setLocalRules] = useState([])

    useEffect(() => {
        if (node) {
            setConfig({ label: node.data.label, description: node.data.description, type: node.data.type, ...node.data.config })
            setLocalRules(rules || [])
        }
    }, [node, rules])

    if (!node) return null

    const handleConfigChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }))
    }

    const addRule = () => {
        setLocalRules([...localRules, {
            id: `rule-${Date.now()}`,
            name: `Rule ${localRules.length + 1}`,
            stepId: node.id,
            conditions: [{ field: "", operator: "==", value: "" }],
            logicalOperator: "AND",
            onTrueStepId: "",
            onFalseStepId: ""
        }])
    }

    const updateRule = (ruleId, field, value) => {
        setLocalRules(prev => prev.map(r => r.id === ruleId ? { ...r, [field]: value } : r))
    }

    const updateCondition = (ruleId, conditionIndex, field, value) => {
        setLocalRules(prev => prev.map(r => {
            if (r.id !== ruleId) return r
            const newConds = [...r.conditions]
            newConds[conditionIndex] = { ...newConds[conditionIndex], [field]: value }
            return { ...r, conditions: newConds }
        }))
    }

    const removeRule = (ruleId) => {
        setLocalRules(prev => prev.filter(r => r.id !== ruleId))
    }

    const handleSave = () => {
        onSaveNode(node.id, config)
        onSaveRules(node.id, localRules)
        onClose()
    }

    return (
        <div className="step-config-panel">
            <div className="panel-header">
                <div>
                    <h3>Configure Node</h3>
                    <p className="text-muted">{node.id}</p>
                </div>
                <button className="icon-btn" onClick={onClose}>✕</button>
            </div>

            <div className="panel-body">
                <div className="config-section">
                    <h4>Basic Settings</h4>
                    <div className="form-group">
                        <label className="form-label">Node Label</label>
                        <input className="form-control" value={config.label || ""} onChange={e => handleConfigChange("label", e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Node Type</label>
                        <select className="form-control" value={config.type || "Action"} onChange={e => handleConfigChange("type", e.target.value)}>
                            {STEP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-control" value={config.description || ""} onChange={e => handleConfigChange("description", e.target.value)} rows={2} />
                    </div>
                </div>

                {config.type === "Action" && (
                    <div className="config-section">
                        <h4>Action Settings</h4>
                        <div className="form-group">
                            <label className="form-label">Action Type</label>
                            <select className="form-control" value={config.action || "Add Field"} onChange={e => handleConfigChange("action", e.target.value)}>
                                <option value="Add Field">Add Field</option>
                                <option value="Log Output">Log Output</option>
                            </select>
                        </div>
                        {config.action === "Add Field" && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Field Name</label>
                                    <input className="form-control" value={config.fieldName || ""} onChange={e => handleConfigChange("fieldName", e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Value</label>
                                    <input className="form-control" value={config.fieldValue || ""} onChange={e => handleConfigChange("fieldValue", e.target.value)} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {config.type === "Delay" && (
                    <div className="config-section">
                        <h4>Delay Settings</h4>
                        <div className="form-group">
                            <label className="form-label">Wait Time (ms)</label>
                            <input type="number" className="form-control" value={config.ms || 1000} onChange={e => handleConfigChange("ms", e.target.value)} />
                        </div>
                    </div>
                )}

                <div className="config-section">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h4>Conditional Logic (Rules)</h4>
                        <button className="btn btn-secondary btn-sm" onClick={addRule}>+ Add Rule</button>
                    </div>

                    {localRules.map((rule, idx) => (
                        <div key={rule.id} className="rule-card">
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <input className="rule-name-input" value={rule.name} onChange={e => updateRule(rule.id, "name", e.target.value)} />
                                <button className="icon-btn text-danger" onClick={() => removeRule(rule.id)}>✕</button>
                            </div>

                            {rule.conditions.map((cond, cIdx) => (
                                <div key={cIdx} className="condition-row">
                                    <input className="form-control" placeholder="Field (e.g. amount)" value={cond.field} onChange={e => updateCondition(rule.id, cIdx, "field", e.target.value)} />
                                    <select className="form-control op-select" value={cond.operator} onChange={e => updateCondition(rule.id, cIdx, "operator", e.target.value)}>
                                        {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                                    </select>
                                    <input className="form-control" placeholder="Value" value={cond.value} onChange={e => updateCondition(rule.id, cIdx, "value", e.target.value)} />
                                </div>
                            ))}

                            <div className="rule-outcome">
                                <span>IF MATCH THEN GO TO:</span>
                                <input className="form-control" placeholder="Step ID" value={rule.onTrueStepId || ""} onChange={e => updateRule(rule.id, "onTrueStepId", e.target.value)} />
                            </div>
                            <div className="rule-outcome false">
                                <span>ELSE GO TO:</span>
                                <input className="form-control" placeholder="Step ID" value={rule.onFalseStepId || ""} onChange={e => updateRule(rule.id, "onFalseStepId", e.target.value)} />
                            </div>
                        </div>
                    ))}
                    {localRules.length === 0 && (
                        <div className="empty-rules">No rules defined for this step. Default linear path will be used.</div>
                    )}
                </div>
            </div>

            <div className="panel-footer">
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>Save Config</button>
            </div>
        </div>
    )
}

export default StepConfigPanel
