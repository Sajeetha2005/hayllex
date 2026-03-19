import React, { useState } from "react"
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis
} from "recharts"

function ScatterChartWidget({ config, data }) {
    const { title, description, xAxis, yAxis, chartColor } = config || {}
    const color = chartColor || "#54bd95"
    const [zoom, setZoom] = useState(1)
    const zoomIn = () => setZoom(z => Math.min(z + 0.5, 3))
    const zoomOut = () => setZoom(z => Math.max(z - 0.5, 1))
    const resetZoom = () => setZoom(1)
    const zoomBtnStyle = { background: "transparent", border: "1px solid var(--border-light)", color: "var(--text-secondary)", borderRadius: "4px", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "12px", padding: 0 }
    const chartData = data || []

    const scatterData = chartData.map(d => ({
        x: isNaN(d.name) ? 0 : Number(d.name),
        y: Number(d[yAxis] || d.value || 0)
    }))

    return (
        <div className="widget-card">
            <div className="widget-card-header">
                <span className="widget-title">{title || "Scatter Plot"}</span>
                <div style={{ display: "flex", gap: "4px" }}>
                    <button onClick={zoomOut} style={zoomBtnStyle} title="Zoom Out">-</button>
                    <button onClick={zoomIn} style={zoomBtnStyle} title="Zoom In">+</button>
                    {zoom !== 1 && <button onClick={resetZoom} style={zoomBtnStyle} title="Reset Zoom">↺</button>}
                </div>
            </div>
            {description && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 8 }}>{description}</div>}
            {!scatterData.length || !scatterData.some(d => d.y !== 0) ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    No data available
                </div>
            ) : (
                <div style={{ flex: 1, minHeight: 0, overflow: "auto", display: "flex" }}>
                    <div style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%`, minWidth: "100%", minHeight: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis type="number" dataKey="x" name={xAxis} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                            <YAxis type="number" dataKey="y" name={yAxis} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                            <ZAxis range={[60, 100]} />
                            <Tooltip
                                cursor={{ strokeDasharray: "3 3" }}
                                contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 8, color: "var(--text-primary)", fontSize: 12 }}
                            />
                            <Scatter data={scatterData} fill={color} fillOpacity={0.8} />
                        </ScatterChart>
                    </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ScatterChartWidget
