import React, { useState, useEffect } from "react"
import { Responsive, WidthProvider } from "react-grid-layout"
import axios from "axios"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

import KPIWidget from "../widgets/KPIWidget"
import BarChartWidget from "../widgets/BarChartWidget"
import LineChartWidget from "../widgets/LineChartWidget"
import AreaChartWidget from "../widgets/AreaChartWidget"
import ScatterChartWidget from "../widgets/ScatterChartWidget"
import PieChartWidget from "../widgets/PieChartWidget"
import TableWidget from "../widgets/TableWidget"
import { WIDGET_DEFAULTS } from "../components/WidgetSettingsPanel"
import { useNavigate } from "react-router-dom"

const ResponsiveGridLayout = WidthProvider(Responsive)
const ROW_HEIGHT = 80
const BREAKPOINTS = { lg: 1200, md: 768, sm: 0 }
const COLS = { lg: 12, md: 8, sm: 4 }

function Dashboard() {
    const [widgets, setWidgets] = useState([])
    const [layouts, setLayouts] = useState({})
    const [ordersData, setOrdersData] = useState([])
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState({ start: "", end: "" })
    const [timePreset, setTimePreset] = useState("all")
    const navigate = useNavigate()

    useEffect(() => {
        loadDashboard()
    }, [])

    useEffect(() => {
        if (widgets.length > 0) {
            fetchAllWidgetData(widgets)
        }
    }, [dateRange])

    const fetchOrders = async (range) => {
        const params = {}
        if (range?.start && range?.end) {
            params.startDate = range.start
            params.endDate = range.end
        }
        const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders`, { params })
        return res.data
    }

    const loadDashboard = async () => {
        setLoading(true)
        try {
            const [layoutRes, ordersRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/dashboard/layout`),
                fetchOrders()
            ])

            setOrdersData(ordersRes)

            if (layoutRes.data && layoutRes.data.widgets && layoutRes.data.widgets.length > 0) {
                const widgetsData = layoutRes.data.widgets
                const enriched = await enrichWidgetsWithData(widgetsData)
                setWidgets(enriched)

                const lgLayout = widgetsData.map(w => ({
                    i: w.id,
                    x: w.layout?.x || 0,
                    y: w.layout?.y || 0,
                    w: w.layout?.w || w.config?.width || WIDGET_DEFAULTS[w.type]?.width || 4,
                    h: w.layout?.h || w.config?.height || WIDGET_DEFAULTS[w.type]?.height || 4,
                    minW: 1, minH: 1, static: true
                }))
                setLayouts({ lg: lgLayout })
            }
        } catch (e) {
            console.error("Failed to load dashboard:", e)
        } finally {
            setLoading(false)
        }
    }

    const fetchAllWidgetData = async (widgetsToUpdate) => {
        const enriched = await enrichWidgetsWithData(widgetsToUpdate)
        setWidgets(enriched)
        const orders = await fetchOrders(dateRange)
        setOrdersData(orders)
    }

    const enrichWidgetsWithData = async (widgetsData) => {
        return await Promise.all(widgetsData.map(async (w) => {
            try {
                let data = null
                const params = {}
                if (dateRange.start && dateRange.end) {
                    params.startDate = dateRange.start
                    params.endDate = dateRange.end
                }

                if (w.type === "kpi") {
                    const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/dashboard/aggregate`, {
                        params: { metric: w.config?.metric, aggregation: w.config?.aggregation, ...params }
                    })
                    data = res.data.value
                } else if (["bar", "line", "area", "scatter"].includes(w.type)) {
                    const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/dashboard/chartdata`, {
                        params: { xField: w.config?.xAxis, yField: w.config?.yAxis, ...params }
                    })
                    data = res.data
                } else if (w.type === "pie") {
                    const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/dashboard/chartdata`, {
                        params: { chartData: w.config?.chartData, ...params }
                    })
                    data = res.data
                }
                return { ...w, data }
            } catch {
                return w
            }
        }))
    }

    const handlePresetChange = (e) => {
        const preset = e.target.value
        setTimePreset(preset)
        
        if (preset === "all") {
            setDateRange({ start: "", end: "" })
            return
        }

        const end = new Date()
        const start = new Date()

        if (preset === "1h") start.setHours(start.getHours() - 1)
        else if (preset === "1d") start.setDate(start.getDate() - 1)
        else if (preset === "1w") start.setDate(start.getDate() - 7)
        else if (preset === "1m") start.setMonth(start.getMonth() - 1)

        setDateRange({
            start: start.toISOString(),
            end: end.toISOString()
        })
    }

    const toLocalDatetimeInput = (isoString) => {
        if (!isoString) return ""
        const d = new Date(isoString)
        if (isNaN(d.getTime())) return ""
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
        return d.toISOString().slice(0, 16)
    }

    const handleDateChange = (field, localValue) => {
        setTimePreset("custom")
        if (!localValue) {
            setDateRange(prev => ({ ...prev, [field]: "" }))
            return
        }
        const d = new Date(localValue)
        setDateRange(prev => ({ ...prev, [field]: d.toISOString() }))
    }

    const renderWidget = (widget) => {
        switch (widget.type) {
            case "kpi": return <KPIWidget config={widget.config} data={widget.data} />
            case "bar": return <BarChartWidget config={widget.config} data={widget.data || []} />
            case "line": return <LineChartWidget config={widget.config} data={widget.data || []} />
            case "area": return <AreaChartWidget config={widget.config} data={widget.data || []} />
            case "scatter": return <ScatterChartWidget config={widget.config} data={widget.data || []} />
            case "pie": return <PieChartWidget config={widget.config} data={widget.data || []} />
            case "table": return <TableWidget config={widget.config} data={ordersData} />
            case "datefilter": return (
                <div className="date-filter-widget" style={{ height: "100%" }}>
                    <span className="date-filter-label">📅 Date Range:</span>
                    <div className="date-filter-inputs">
                        <input
                            type="datetime-local"
                            className="form-control"
                            style={{ width: "auto" }}
                            value={toLocalDatetimeInput(dateRange.start)}
                            onChange={e => handleDateChange("start", e.target.value)}
                        />
                        <span className="date-sep">to</span>
                        <input
                            type="datetime-local"
                            className="form-control"
                            style={{ width: "auto" }}
                            value={toLocalDatetimeInput(dateRange.end)}
                            onChange={e => handleDateChange("end", e.target.value)}
                        />
                        {(dateRange.start || dateRange.end) && (
                            <button className="btn btn-secondary" style={{ padding: "6px 10px", fontSize: "0.8rem" }} onClick={() => { setTimePreset("all"); setDateRange({ start: "", end: "" }); }}>
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            )
            default: return <div className="widget-card"><span>Unknown</span></div>
        }
    }

    const hasWidgets = widgets.length > 0

    const seedDefault = async () => {
        setLoading(true)
        try {
            await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/dashboard/seed-default`)
            await loadDashboard()
        } catch (e) {
            console.error("Failed to seed default dashboard:", e)
            setLoading(false)
        }
    }

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="page-title-group">
                    <h1>Dashboard</h1>
                    <p>Your personalized data view</p>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <select 
                        className="form-control" 
                        value={timePreset} 
                        onChange={handlePresetChange}
                        style={{ width: "160px", background: "var(--bg-card)", color: "var(--text-primary)" }}
                    >
                        <option value="all">All Time</option>
                        <option value="1h">Last 1 Hour</option>
                        <option value="1d">Last 1 Day</option>
                        <option value="1w">Last 1 Week</option>
                        <option value="1m">Last 1 Month</option>
                        <option value="custom">Custom Range</option>
                    </select>
                    <button className="btn btn-primary" onClick={() => navigate("/configure")}>
                        ⚙️ Configure Dashboard
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "80px", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
                    Loading dashboard...
                </div>
            ) : !hasWidgets ? (
                <div className="empty-state" style={{ minHeight: "60vh" }}>
                    <div className="empty-state-icon">🎨</div>
                    <h3>No Widgets Configured</h3>
                    <p>
                        Your dashboard is empty. Click <strong>Configure Dashboard</strong> to drag and drop
                        widgets and build your personalized view — or use Quick Setup to instantly load all chart types.
                    </p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                        <button className="btn btn-primary" onClick={seedDefault}>
                            ⚡ Quick Setup (All Charts)
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate("/configure")}>
                            ⚙️ Configure Dashboard
                        </button>
                    </div>
                </div>
            ) : (
                <ResponsiveGridLayout
                    className="dashboard-layout"
                    layouts={layouts}
                    breakpoints={BREAKPOINTS}
                    cols={COLS}
                    rowHeight={ROW_HEIGHT}
                    isDraggable={false}
                    isResizable={false}
                    margin={[12, 12]}
                >
                    {widgets.map(widget => (
                        <div key={widget.id} style={{ height: "100%" }}>
                            {renderWidget(widget)}
                        </div>
                    ))}
                </ResponsiveGridLayout>
            )}
        </div>
    )
}

export default Dashboard

