import React, { useState, useEffect, useCallback } from "react"
import { Responsive, WidthProvider } from "react-grid-layout"
import axios from "axios"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

import WidgetSettingsPanel, { WIDGET_DEFAULTS } from "../components/WidgetSettingsPanel"
import KPIWidget from "../widgets/KPIWidget"
import BarChartWidget from "../widgets/BarChartWidget"
import LineChartWidget from "../widgets/LineChartWidget"
import AreaChartWidget from "../widgets/AreaChartWidget"
import ScatterChartWidget from "../widgets/ScatterChartWidget"
import PieChartWidget from "../widgets/PieChartWidget"
import TableWidget from "../widgets/TableWidget"

const ResponsiveGridLayout = WidthProvider(Responsive)

const WIDGET_PALETTE = [
    { type: "kpi", label: "KPI Card", icon: "📊" },
    { type: "bar", label: "Bar Chart", icon: "📶" },
    { type: "line", label: "Line Chart", icon: "📈" },
    { type: "area", label: "Area Chart", icon: "🌊" },
    { type: "scatter", label: "Scatter Plot", icon: "🔵" },
    { type: "pie", label: "Pie Chart", icon: "🥧" },
    { type: "table", label: "Table", icon: "📋" },
    { type: "datefilter", label: "Date Filter", icon: "📅" }
]

const ROW_HEIGHT = 80
const BREAKPOINTS = { lg: 1200, md: 768, sm: 0 }
const COLS = { lg: 12, md: 8, sm: 4 }

function getDefaultLayout(id, type, config) {
    const w = config.width || WIDGET_DEFAULTS[type]?.width || 4
    const h = config.height || WIDGET_DEFAULTS[type]?.height || 4
    return { i: id, x: 0, y: Infinity, w, h, minW: 1, minH: 1 }
}

function renderWidget(widget, ordersData, dateRange) {
    const { type, config, data } = widget
    const props = { config, data }

    switch (type) {
        case "kpi": return <KPIWidget {...props} />
        case "bar": return <BarChartWidget {...props} />
        case "line": return <LineChartWidget {...props} />
        case "area": return <AreaChartWidget {...props} />
        case "scatter": return <ScatterChartWidget {...props} />
        case "pie": return <PieChartWidget {...props} />
        case "table": return <TableWidget config={config} data={ordersData} />
        case "datefilter": return (
            <div className="date-filter-widget" style={{ height: "100%" }}>
                <span className="date-filter-label">📅 Date Range</span>
                <div className="date-filter-inputs">
                    <input type="date" className="form-control" style={{ width: "auto" }} value={dateRange.start} readOnly />
                    <span className="date-sep">to</span>
                    <input type="date" className="form-control" style={{ width: "auto" }} value={dateRange.end} readOnly />
                </div>
            </div>
        )
        default: return <div className="widget-card"><span>Unknown widget</span></div>
    }
}

function DashboardConfigPage() {
    const [widgets, setWidgets] = useState([])
    const [layouts, setLayouts] = useState({ lg: [] })
    const [settingsWidget, setSettingsWidget] = useState(null)
    const [ordersData, setOrdersData] = useState([])
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [draggingType, setDraggingType] = useState(null)
    const [dateRange] = useState({ start: "", end: "" })
    const isDragOver = React.useRef(false)
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        fetchOrders()
        loadLayout()
    }, [])

    // Auto-save draft to localStorage whenever layout changes
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("dashboard_draft", JSON.stringify({ widgets, layouts }))
        }
    }, [widgets, layouts, isInitialized])

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders`)
            setOrdersData(res.data)
        } catch { }
    }

    const loadLayout = async () => {
        try {
            // Check for locally saved draft first (prevents data loss on tab switch)
            const draftStr = localStorage.getItem("dashboard_draft")
            if (draftStr) {
                try {
                    const draft = JSON.parse(draftStr)
                    if (draft && draft.widgets && draft.widgets.length > 0) {
                        setWidgets(draft.widgets)
                        setLayouts(draft.layouts)
                        setIsInitialized(true)
                        return
                    }
                } catch (e) {
                    localStorage.removeItem("dashboard_draft")
                }
            }

            // Fallback to real backend layout
            const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/dashboard/layout`)
            if (res.data && res.data.widgets && res.data.widgets.length > 0) {
                const widgetsData = res.data.widgets
                setWidgets(widgetsData)

                const lgLayout = widgetsData.map(w => ({
                    i: w.id,
                    x: w.layout?.x || 0,
                    y: w.layout?.y || 0,
                    w: w.config?.width || WIDGET_DEFAULTS[w.type]?.width || 4,
                    h: w.config?.height || WIDGET_DEFAULTS[w.type]?.height || 4,
                    minW: 1, minH: 1
                }))
                setLayouts({ lg: lgLayout })
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsInitialized(true)
        }
    }

    const addWidget = useCallback((type) => {
        const id = `widget-${Date.now()}`
        const config = { ...WIDGET_DEFAULTS[type] }
        const newWidget = {
            id,
            type,
            label: WIDGET_PALETTE.find(p => p.type === type)?.label || type,
            config,
            data: []
        }

        const newLayout = getDefaultLayout(id, type, config)

        setWidgets(prev => [...prev, newWidget])
        setLayouts(prev => ({
            ...prev,
            lg: [...(prev.lg || []), newLayout]
        }))
    }, [])

    const handleDragStart = (type) => {
        setDraggingType(type)
    }

    const handleCanvasDrop = (e) => {
        e.preventDefault()
        if (draggingType) {
            addWidget(draggingType)
            setDraggingType(null)
        }
    }

    const handleDelete = async (id) => {
        // Confirm deletion
        const widget = widgets.find(w => w.id === id)
        const widgetName = widget?.label || widget?.type || 'Widget'
        
        if (!confirm(`Are you sure you want to delete the "${widgetName}" widget? This action cannot be undone.`)) {
            return
        }
        
        // Remove from local state
        setWidgets(prev => prev.filter(w => w.id !== id))
        setLayouts(prev => ({ ...prev, lg: (prev.lg || []).filter(l => l.i !== id) }))
        
        // Immediately save to backend to persist deletion
        try {
            const updatedWidgets = widgets.filter(w => w.id !== id)
            const currentLayout = layouts.lg || []
            const widgetsToSave = updatedWidgets.map(w => {
                const lay = currentLayout.find(l => l.i === w.id) || {}
                return {
                    ...w,
                    layout: { x: lay.x || 0, y: lay.y || 0, w: lay.w || 4, h: lay.h || 4 }
                }
            })
            await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/dashboard/layout`, { widgets: widgetsToSave })
            
            // Show success feedback
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (err) {
            console.error("Failed to delete widget:", err)
            alert("Failed to delete widget. Please try again.")
            // Optionally revert the deletion on error
            setWidgets(prev => [...prev, widgets.find(w => w.id === id)])
        }
    }

    const handleSettings = (widget) => {
        setSettingsWidget(widget)
    }

    const handleSaveConfig = async (updatedConfig) => {
        setWidgets(prev => prev.map(w =>
            w.id === settingsWidget.id
                ? { ...w, config: { ...w.config, ...updatedConfig } }
                : w
        ))

        // update layout sizes
        setLayouts(prev => ({
            ...prev,
            lg: (prev.lg || []).map(l =>
                l.i === settingsWidget.id
                    ? { ...l, w: updatedConfig.width || l.w, h: updatedConfig.height || l.h }
                    : l
            )
        }))

        setSettingsWidget(null)

        // fetch new data for the widget
        await refreshWidgetData(settingsWidget.id, settingsWidget.type, updatedConfig)
    }

    const refreshWidgetData = async (widgetId, type, config) => {
        try {
            let data = null
            if (type === "kpi") {
                const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/dashboard/aggregate`, {
                    params: { metric: config.metric, aggregation: config.aggregation }
                })
                data = res.data.value
            } else if (["bar", "line", "area", "scatter"].includes(type)) {
                const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/dashboard/chartdata`, {
                    params: { xField: config.xAxis, yField: config.yAxis }
                })
                data = res.data
            } else if (type === "pie") {
                const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/dashboard/chartdata`, {
                    params: { chartData: config.chartData }
                })
                data = res.data
            }

            if (data !== null) {
                setWidgets(prev => prev.map(w =>
                    w.id === widgetId ? { ...w, data } : w
                ))
            }
        } catch { }
    }

    const handleLayoutChange = (current, all) => {
        setLayouts(all)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const currentLayout = layouts.lg || []
            const widgetsToSave = widgets.map(w => {
                const lay = currentLayout.find(l => l.i === w.id) || {}
                return {
                    ...w,
                    layout: { x: lay.x || 0, y: lay.y || 0, w: lay.w || 4, h: lay.h || 4 }
                }
            })
            await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/dashboard/layout`, { widgets: widgetsToSave })
            
            // Clear the local draft now that we saved it to the server
            localStorage.removeItem("dashboard_draft")
            
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            alert("Failed to save dashboard. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="config-page">
            {/* Sidebar */}
            <div className="config-sidebar">
                <div className="config-sidebar-header">
                    <h3>Widgets</h3>
                    <p>Drag to canvas or click to add</p>
                </div>
                <div className="widget-palette">
                    {WIDGET_PALETTE.map(w => (
                        <div
                            key={w.type}
                            className="widget-palette-item"
                            draggable
                            onDragStart={() => handleDragStart(w.type)}
                            onDragEnd={() => setDraggingType(null)}
                            onClick={() => addWidget(w.type)}
                        >
                            <span className="widget-palette-icon">{w.icon}</span>
                            <span>{w.label}</span>
                        </div>
                    ))}
                </div>
                <div className="config-footer" style={{ borderTop: "1px solid var(--border)", padding: "12px", display: "flex", flexDirection: "column", gap: 6 }}>
                    <button
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? "Saving…" : saved ? "✅ Saved!" : "💾 Save Configuration"}
                    </button>
                    <a href="/" className="btn btn-secondary" style={{ width: "100%", textAlign: "center", textDecoration: "none" }}>
                        ← Back to Dashboard
                    </a>
                </div>
            </div>

            {/* Canvas */}
            <div
                className="config-canvas"
                onDragOver={e => { e.preventDefault(); isDragOver.current = true }}
                onDrop={handleCanvasDrop}
                onDragLeave={() => { isDragOver.current = false }}
            >
                {widgets.length === 0 ? (
                    <div className="config-canvas-hint">
                        <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎨</div>
                        <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                            Empty Canvas
                        </div>
                        <div>Drag widgets from the sidebar or click on them to add to the dashboard</div>
                    </div>
                ) : (
                    <ResponsiveGridLayout
                        className="dashboard-layout"
                        layouts={layouts}
                        breakpoints={BREAKPOINTS}
                        cols={COLS}
                        rowHeight={ROW_HEIGHT}
                        onLayoutChange={handleLayoutChange}
                        draggableHandle=".widget-drag-handle"
                        isResizable
                        isDraggable
                        margin={[12, 12]}
                    >
                        {widgets.map(widget => (
                            <div key={widget.id}>
                                <div className="widget-wrapper">
                                    {/* Overlay on hover */}
                                    <div className="widget-overlay">
                                        <button
                                            className="btn"
                                            style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", padding: "5px 10px", fontSize: "0.78rem", gap: 4 }}
                                            onClick={() => handleSettings(widget)}
                                            title="Widget Settings"
                                        >
                                            ⚙️ Settings
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            style={{ padding: "5px 10px", fontSize: "0.78rem", gap: 4 }}
                                            onClick={() => handleDelete(widget.id)}
                                            title="Delete Widget"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    {/* Drag handle */}
                                    <div
                                        className="widget-drag-handle"
                                        style={{
                                            position: "absolute",
                                            top: 8, left: 8,
                                            cursor: "grab",
                                            color: "var(--text-muted)",
                                            fontSize: "0.7rem",
                                            zIndex: 5,
                                            opacity: 0,
                                            transition: "opacity 0.2s"
                                        }}
                                    >
                                        ⠿⠿
                                    </div>
                                    <div style={{ height: "100%", pointerEvents: "none" }}>
                                        {renderWidget(widget, ordersData, dateRange)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </ResponsiveGridLayout>
                )}
            </div>

            {/* Settings Panel */}
            {settingsWidget && (
                <WidgetSettingsPanel
                    widget={settingsWidget}
                    onSave={handleSaveConfig}
                    onClose={() => setSettingsWidget(null)}
                />
            )}
        </div>
    )
}

export default DashboardConfigPage
