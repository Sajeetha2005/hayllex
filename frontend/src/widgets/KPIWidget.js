import React from "react"

function KPIWidget({ config, data }) {
    const { title, description, metric, aggregation, dataFormat, decimalPrecision } = config || {}

    let displayValue = data !== undefined && data !== null ? data : "—"

    if (data !== undefined && data !== null) {
        const precision = Number(decimalPrecision) || 0
        const num = Number(data)
        if (dataFormat === "Currency") {
            displayValue = "$" + num.toFixed(precision)
        } else {
            displayValue = num.toFixed(precision)
        }
    }

    const getIcon = () => {
        if (!metric) return "📊"
        if (metric.includes("Total") || metric.includes("price") || metric.includes("Unit")) return "💰"
        if (metric.includes("Quantity")) return "📦"
        if (metric.includes("Customer")) return "👤"
        return "📈"
    }

    return (
        <div className="widget-card">
            <div className="widget-card-header">
                <span className="widget-title">{title || "Untitled"}</span>
                <span style={{ fontSize: "1.2rem" }}>{getIcon()}</span>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div className="kpi-value">{displayValue}</div>
                {metric && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                        <span
                            style={{
                                background: "rgba(84,189,149,0.12)",
                                color: "var(--accent)",
                                borderRadius: 4,
                                padding: "2px 8px",
                                fontSize: "0.72rem",
                                fontWeight: 600
                            }}
                        >
                            {aggregation || "Count"}
                        </span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{metric}</span>
                    </div>
                )}
                {description && (
                    <div className="kpi-description" style={{ marginTop: 6 }}>{description}</div>
                )}
            </div>
        </div>
    )
}

export default KPIWidget