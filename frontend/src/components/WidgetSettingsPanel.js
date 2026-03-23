import React, { useState, useEffect, useRef } from "react"
import { HexColorPicker } from "react-colorful"

const METRICS = [
    "Customer ID", "Customer name", "Email id", "Address",
    "Order date", "Product", "Created by", "Status",
    "Total amount", "Unit price", "Quantity"
]

const NUMERIC_METRICS = ["Total amount", "Unit price", "Quantity"]

const CHART_AXES = ["Product", "Quantity", "Unit price", "Total amount", "Status", "Created by", "Duration"]
const PIE_DATAS = ["Product", "Quantity", "Unit price", "Total amount", "Status", "Created by"]
const TABLE_COLS = [
    "Customer ID", "Customer name", "Email id", "Phone number", "Address",
    "Order ID", "Order date", "Product", "Quantity", "Unit price",
    "Total amount", "Status", "Created by"
]

function ColorPickerField({ label, value, onChange }) {
    const [open, setOpen] = useState(false)
    const ref = useRef()

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <div className="color-picker-group" style={{ position: "relative" }} ref={ref}>
                <div
                    className="color-swatch"
                    style={{ background: value }}
                    onClick={() => setOpen(o => !o)}
                />
                <input
                    type="text"
                    className="form-control"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    style={{ flex: 1, fontFamily: "monospace" }}
                    placeholder="#000000"
                />
                {open && (
                    <div className="color-picker-popup">
                        <HexColorPicker color={value} onChange={onChange} />
                    </div>
                )}
            </div>
        </div>
    )
}

function MultiSelectField({ label, options, selected, onChange }) {
    const [open, setOpen] = useState(false)
    const ref = useRef()

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const toggle = (opt) => {
        if (selected.includes(opt)) {
            onChange(selected.filter(s => s !== opt))
        } else {
            onChange([...selected, opt])
        }
    }

    return (
        <div className="form-group">
            <label className="form-label">{label} <span className="required">*</span></label>
            <div className="multiselect-dropdown" ref={ref}>
                <div className="multiselect-trigger" onClick={() => setOpen(o => !o)}>
                    <div className="multiselect-tags">
                        {selected.length === 0
                            ? <span style={{ color: "var(--text-muted)" }}>Select columns…</span>
                            : selected.map(s => <span key={s} className="tag">{s}</span>)
                        }
                    </div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>▼</span>
                </div>
                {open && (
                    <div className="multiselect-list">
                        {options.map(opt => (
                            <div
                                key={opt}
                                className={`multiselect-option ${selected.includes(opt) ? "selected" : ""}`}
                                onClick={() => toggle(opt)}
                            >
                                <input type="checkbox" readOnly checked={selected.includes(opt)} style={{ accentColor: "var(--accent)" }} />
                                {opt}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

const WIDGET_DEFAULTS = {
    kpi: { title: "Untitled", width: 2, height: 2, metric: "", aggregation: "Count", dataFormat: "Number", decimalPrecision: 0 },
    bar: { title: "Untitled", width: 5, height: 5, xAxis: "Product", yAxis: "Total amount", chartColor: "#54bd95", showDataLabel: false },
    line: { title: "Untitled", width: 5, height: 5, xAxis: "Product", yAxis: "Total amount", chartColor: "#4a9ede", showDataLabel: false },
    area: { title: "Untitled", width: 5, height: 5, xAxis: "Product", yAxis: "Total amount", chartColor: "#54bd95", showDataLabel: false },
    scatter: { title: "Untitled", width: 5, height: 5, xAxis: "Quantity", yAxis: "Total amount", chartColor: "#f5a623", showDataLabel: false },
    pie: { title: "Untitled", width: 4, height: 4, chartData: "Product", showLegend: true },
    table: { title: "Untitled", width: 4, height: 4, columns: [], sortBy: "", pagination: "", applyFilter: false, fontSize: 14, headerBackground: "#54bd95" },
    datefilter: { title: "Date Filter", width: 12, height: 1 }
}

function WidgetSettingsPanel({ widget, onSave, onClose }) {
    const [config, setConfig] = useState({})

    useEffect(() => {
        if (widget) {
            setConfig({ ...WIDGET_DEFAULTS[widget.type], ...widget.config })
        }
    }, [widget])

    if (!widget) return null

    const set = (key, value) => setConfig(prev => ({ ...prev, [key]: value }))

    const SizeFields = ({ defaultW, defaultH }) => (
        <div className="settings-section">
            <div className="settings-section-title">Widget Size</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
                <div className="form-group">
                    <label className="form-label">Width (Columns) <span className="required">*</span></label>
                    <input type="number" className="form-control" min={1} value={config.width ?? defaultW} onChange={e => set("width", Math.max(1, Number(e.target.value)))} />
                </div>
                <div className="form-group">
                    <label className="form-label">Height (Rows) <span className="required">*</span></label>
                    <input type="number" className="form-control" min={1} value={config.height ?? defaultH} onChange={e => set("height", Math.max(1, Number(e.target.value)))} />
                </div>
            </div>
        </div>
    )

    const BaseFields = () => (
        <div className="settings-section">
            <div className="settings-section-title">General</div>
            <div className="form-group">
                <label className="form-label">Widget title <span className="required">*</span></label>
                <input 
                    type="text" 
                    className="form-control" 
                    value={config.title || ""} 
                    onChange={e => set("title", e.target.value)}
                    placeholder="Enter widget title..."
                />
            </div>
            <div className="form-group">
                <label className="form-label">Widget type</label>
                <input type="text" className="form-control" readOnly value={widget.label || widget.type} />
            </div>
            <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                    ref={el => {
                        if (el && !el.dataset.initialized) {
                            el.dataset.initialized = 'true'
                            el.addEventListener('input', (e) => {
                                set("description", e.target.value)
                            })
                        }
                    }}
                    className="form-control" 
                    defaultValue={config.description || ""} 
                    rows={2}
                    placeholder="Enter widget description..."
                    style={{ resize: 'vertical' }}
                />
            </div>
        </div>
    )

    const ChartStyling = () => (
        <div className="settings-section">
            <div className="settings-section-title">Styling</div>
            <ColorPickerField label="Chart color" value={config.chartColor || "#54bd95"} onChange={v => set("chartColor", v)} />
            <div className="form-group">
                <label className="form-check">
                    <input type="checkbox" checked={config.showDataLabel || false} onChange={e => set("showDataLabel", e.target.checked)} />
                    Show data label
                </label>
            </div>
        </div>
    )

    const renderKPI = () => (
        <>
            <BaseFields />
            <SizeFields defaultW={2} defaultH={2} />
            <div className="settings-section">
                <div className="settings-section-title">Data Settings</div>
                <div className="form-group">
                    <label className="form-label">Select metric <span className="required">*</span></label>
                    <select className="form-control" value={config.metric || ""} onChange={e => set("metric", e.target.value)}>
                        <option value="">Select metric</option>
                        {METRICS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Aggregation <span className="required">*</span></label>
                    <select
                        className="form-control"
                        value={config.aggregation || "Count"}
                        onChange={e => set("aggregation", e.target.value)}
                        disabled={config.metric && !NUMERIC_METRICS.includes(config.metric)}
                    >
                        <option value="Count">Count</option>
                        <option value="Sum" disabled={config.metric && !NUMERIC_METRICS.includes(config.metric)}>Sum</option>
                        <option value="Average" disabled={config.metric && !NUMERIC_METRICS.includes(config.metric)}>Average</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Data format <span className="required">*</span></label>
                    <select className="form-control" value={config.dataFormat || "Number"} onChange={e => set("dataFormat", e.target.value)}>
                        <option value="Number">Number</option>
                        <option value="Currency">Currency</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Decimal precision <span className="required">*</span></label>
                    <input type="number" className="form-control" min={0} value={config.decimalPrecision ?? 0} onChange={e => set("decimalPrecision", Math.max(0, Number(e.target.value)))} />
                </div>
            </div>
        </>
    )

    const renderChart = (type) => (
        <>
            <BaseFields />
            <SizeFields defaultW={5} defaultH={5} />
            <div className="settings-section">
                <div className="settings-section-title">Data Settings</div>
                {type !== "scatter" ? (
                    <>
                        <div className="form-group">
                            <label className="form-label">Choose X-Axis data <span className="required">*</span></label>
                            <select className="form-control" value={config.xAxis || "Product"} onChange={e => set("xAxis", e.target.value)}>
                                {CHART_AXES.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Choose Y-Axis data <span className="required">*</span></label>
                            <select className="form-control" value={config.yAxis || "Total amount"} onChange={e => set("yAxis", e.target.value)}>
                                {CHART_AXES.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="form-group">
                            <label className="form-label">X-Axis (numeric) <span className="required">*</span></label>
                            <select className="form-control" value={config.xAxis || "Quantity"} onChange={e => set("xAxis", e.target.value)}>
                                {["Quantity", "Unit price", "Total amount"].map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Y-Axis (numeric) <span className="required">*</span></label>
                            <select className="form-control" value={config.yAxis || "Total amount"} onChange={e => set("yAxis", e.target.value)}>
                                {["Quantity", "Unit price", "Total amount"].map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    </>
                )}
            </div>
            <ChartStyling />
        </>
    )

    const renderPie = () => (
        <>
            <BaseFields />
            <SizeFields defaultW={4} defaultH={4} />
            <div className="settings-section">
                <div className="settings-section-title">Data Settings</div>
                <div className="form-group">
                    <label className="form-label">Choose chart data <span className="required">*</span></label>
                    <select className="form-control" value={config.chartData || "Product"} onChange={e => set("chartData", e.target.value)}>
                        {PIE_DATAS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>
            <div className="settings-section">
                <div className="settings-section-title">Styling</div>
                <div className="form-group">
                    <label className="form-check">
                        <input type="checkbox" checked={config.showLegend || false} onChange={e => set("showLegend", e.target.checked)} />
                        Show legend
                    </label>
                </div>
            </div>
        </>
    )

    const renderTable = () => (
        <>
            <BaseFields />
            <SizeFields defaultW={4} defaultH={4} />
            <div className="settings-section">
                <div className="settings-section-title">Data Settings</div>
                <MultiSelectField
                    label="Choose columns"
                    options={TABLE_COLS}
                    selected={config.columns || []}
                    onChange={v => set("columns", v)}
                />
                <div className="form-group">
                    <label className="form-label">Sort by</label>
                    <select className="form-control" value={config.sortBy || ""} onChange={e => set("sortBy", e.target.value)}>
                        <option value="">None</option>
                        <option value="Ascending">Ascending</option>
                        <option value="Descending">Descending</option>
                        <option value="Order date">Order date</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Pagination</label>
                    <select className="form-control" value={config.pagination || ""} onChange={e => set("pagination", e.target.value)}>
                        <option value="">No pagination</option>
                        <option value="5">5 per page</option>
                        <option value="10">10 per page</option>
                        <option value="15">15 per page</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-check">
                        <input type="checkbox" checked={config.applyFilter || false} onChange={e => set("applyFilter", e.target.checked)} />
                        Apply filter
                    </label>
                </div>
            </div>
            <div className="settings-section">
                <div className="settings-section-title">Styling</div>
                <div className="form-group">
                    <label className="form-label">Font size</label>
                    <input
                        type="number"
                        className="form-control"
                        min={12} max={18}
                        value={config.fontSize || 14}
                        onChange={e => set("fontSize", Math.min(18, Math.max(12, Number(e.target.value))))}
                    />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Range: 12–18</span>
                </div>
                <ColorPickerField
                    label="Header background"
                    value={config.headerBackground || "#54bd95"}
                    onChange={v => set("headerBackground", v)}
                />
            </div>
        </>
    )

    const renderDateFilter = () => (
        <>
            <div className="settings-section">
                <div className="settings-section-title">Date Filter</div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    This widget filters all dashboard data by date range. Configure it by selecting dates on the dashboard.
                </p>
            </div>
            <SizeFields defaultW={12} defaultH={1} />
        </>
    )

    const renderContent = () => {
        switch (widget.type) {
            case "kpi": return renderKPI()
            case "bar": return renderChart("bar")
            case "line": return renderChart("line")
            case "area": return renderChart("area")
            case "scatter": return renderChart("scatter")
            case "pie": return renderPie()
            case "table": return renderTable()
            case "datefilter": return renderDateFilter()
            default: return null
        }
    }

    return (
        <div className="settings-panel">
            <div className="settings-panel-header">
                <div>
                    <h3 style={{ fontSize: "1rem" }}>Widget Settings</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: 2 }}>{widget.label}</p>
                </div>
                <button className="btn-icon" onClick={onClose}>✕</button>
            </div>

            <div className="settings-panel-body">
                {renderContent()}
            </div>

            <div className="settings-panel-footer">
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onSave(config)}>Apply</button>
            </div>
        </div>
    )
}

export { WIDGET_DEFAULTS }
export default WidgetSettingsPanel
