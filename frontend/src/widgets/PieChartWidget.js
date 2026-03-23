import React, { useState } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

const COLORS = ["#54bd95", "#4a9ede", "#f5a623", "#e05c5c", "#9b59b6", "#2ecc71", "#f39c12", "#1abc9c"]

function PieChartWidget({ config, data }) {
    const { title, description, showLegend } = config || {}
    const [zoom, setZoom] = useState(1)
    const zoomIn = () => setZoom(z => Math.min(z + 0.5, 3))
    const zoomOut = () => setZoom(z => Math.max(z - 0.5, 1))
    const resetZoom = () => setZoom(1)
    const zoomBtnStyle = { background: "transparent", border: "1px solid var(--border-light)", color: "var(--text-secondary)", borderRadius: "4px", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "12px", padding: 0 }
    const chartData = data || []

    if (!chartData.length) {
        return (
            <div className="widget-card">
                <div className="widget-card-header">
                    <span className="widget-title">{title || "Pie Chart"}</span>
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    No data available
                </div>
            </div>
        )
    }

    return (
        <div className="widget-card">
            <div className="widget-card-header">
                <span className="widget-title">{title || "Pie Chart"}</span>
                <div style={{ display: "flex", gap: "4px" }}>
                    <button onClick={zoomOut} style={zoomBtnStyle} title="Zoom Out">-</button>
                    <button onClick={zoomIn} style={zoomBtnStyle} title="Zoom In">+</button>
                    {zoom !== 1 && <button onClick={resetZoom} style={zoomBtnStyle} title="Reset Zoom">↺</button>}
                </div>
            </div>
            {description && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 8 }}>{description}</div>}
            <div style={{ flex: 1, minHeight: 0, overflow: "auto", display: "flex" }}>
                <div style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%`, minWidth: "100%", minHeight: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius="30%"
                            outerRadius="65%"
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                        >
                            {chartData.map((entry, i) => (
                                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                background: "var(--bg-card)",
                                border: "1px solid var(--border-light)",
                                borderRadius: 8,
                                color: "var(--text-primary)",
                                fontSize: 12
                            }}
                        />
                        {showLegend && (
                            <Legend
                                formatter={(value) => <span style={{ color: "var(--text-secondary)", fontSize: 11 }}>{value}</span>}
                            />
                        )}
                    </PieChart>
                </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

export default PieChartWidget
